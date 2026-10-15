import base64
import json
import os
import re
import smtplib
from email.header import Header
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

import boto3
import psycopg2
from botocore.exceptions import ClientError

MAIL_TO = "info@heavyprom.ru"
MAIL_FROM = "heavyprom.ru@yandex.ru"
PHONE = "+7 (904) 941-36-69"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}
KINDS = {"tz": "Техническое задание", "contract": "Проект договора", "responsibility": "Зона ответственности"}
ALLOWED_EXT = {"pdf", "doc", "docx", "xls", "xlsx", "rtf", "odt", "txt", "zip", "rar", "7z", "jpg", "jpeg", "png", "dwg"}
MAX_FILE = 10 * 1024 * 1024
MAX_PARTS = 8
MAX_CHUNK = 2 * 1024 * 1024
MAX_PER_KIND = 5
MAX_TOTAL = 50 * 1024 * 1024
ATTACH_LIMIT = 15 * 1024 * 1024
UID_RE = re.compile(r"^[a-f0-9]{32}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


def resp(code: int, data: dict) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}


def esc(v: str) -> str:
    return v.replace("'", "''")


def s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def ext_of(name: str) -> str:
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""


def clean_name(name: str) -> str:
    name = re.sub(r"[\\/:*?\"<>|\r\n\t]", "_", name).strip()
    return name[:150] or "file"


def final_key(uid: str, ext: str) -> str:
    return f"leads/files/{uid}.{ext}"


def upload_chunk(data: dict) -> dict:
    uid = str(data.get("upload_id", ""))
    index = data.get("index")
    if not UID_RE.match(uid) or not isinstance(index, int) or not 0 <= index < MAX_PARTS:
        return resp(400, {"error": "Некорректная часть файла"})
    try:
        raw = base64.b64decode(str(data.get("data", "")), validate=True)
    except ValueError:
        raw = b""
    if not raw or len(raw) > MAX_CHUNK:
        return resp(400, {"error": "Некорректный размер части файла"})
    s3().put_object(Bucket="files", Key=f"leads/tmp/{uid}/{index}", Body=raw)
    return resp(200, {"ok": True})


def finish_file(data: dict) -> dict:
    uid = str(data.get("upload_id", ""))
    parts = data.get("parts")
    ext = ext_of(clean_name(str(data.get("name", ""))))
    if not UID_RE.match(uid) or not isinstance(parts, int) or not 1 <= parts <= MAX_PARTS or ext not in ALLOWED_EXT:
        return resp(400, {"error": "Некорректный файл"})
    client = s3()
    try:
        body = b"".join(
            client.get_object(Bucket="files", Key=f"leads/tmp/{uid}/{i}")["Body"].read() for i in range(parts)
        )
    except ClientError:
        return resp(400, {"error": "Файл загружен не полностью"})
    if len(body) > MAX_FILE:
        return resp(400, {"error": "Файл больше 10 МБ"})
    client.put_object(Bucket="files", Key=final_key(uid, ext), Body=body, ContentDisposition="attachment")
    for i in range(parts):
        try:
            client.delete_object(Bucket="files", Key=f"leads/tmp/{uid}/{i}")
        except ClientError as e:
            print(f"tmp cleanup failed: {e}")
    return resp(200, {"ok": True})


def load_file(client, f: dict):
    uid = str(f.get("upload_id", ""))
    kind = str(f.get("kind", ""))
    name = clean_name(str(f.get("name", "")))
    ext = ext_of(name)
    if not UID_RE.match(uid) or kind not in KINDS or ext not in ALLOWED_EXT:
        return None
    key = final_key(uid, ext)
    try:
        body = client.get_object(Bucket="files", Key=key)["Body"].read()
    except ClientError:
        return None
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return {"kind": kind, "name": name, "size": len(body), "url": url, "data": body}


def smtp_creds():
    password = os.environ.get("INFO_SMTP_PASSWORD")
    if password:
        return MAIL_TO, password
    password = os.environ.get("SMTP_PASSWORD")
    if password:
        return MAIL_FROM, password
    return None, None


def smtp_send(sender: str, password: str, to: str, msg) -> None:
    raw = msg.as_string()
    try:
        with smtplib.SMTP_SSL("smtp.yandex.ru", 465, timeout=20) as s:
            s.login(sender, password)
            s.sendmail(sender, [to], raw)
    except (ConnectionRefusedError, OSError) as e:
        if isinstance(e, smtplib.SMTPException):
            raise
        print(f"smtp 465 failed: {e}, trying 587")
        with smtplib.SMTP("smtp.yandex.ru", 587, timeout=20) as s:
            s.starttls()
            s.login(sender, password)
            s.sendmail(sender, [to], raw)


def mb(size: int) -> str:
    return f"{size / 1024 / 1024:.1f} МБ" if size >= 1024 * 1024 else f"{max(1, round(size / 1024))} КБ"


def files_block(files: list, with_links: bool) -> list:
    lines = []
    for kind, title in KINDS.items():
        group = [f for f in files if f["kind"] == kind]
        if not group:
            continue
        lines.append(f"{title}:")
        for f in group:
            lines.append(f"  • {f['name']} ({mb(f['size'])})")
            if with_links:
                lines.append(f"    {f['url']}")
    return lines


def send_company_mail(lead: dict, files: list) -> bool:
    sender, password = smtp_creds()
    if not sender:
        return False
    attach = sum(f["size"] for f in files) <= ATTACH_LIMIT
    lines = [
        "Новая заявка с сайта heavyprom.ru",
        "",
        f"Имя: {lead['name']}",
        f"Телефон: {lead['phone']}",
        f"Почта: {lead['email']}",
        f"Компания: {lead['company'] or '— не указана'}",
        f"ИНН: {lead['inn'] or '— не указан'}",
        f"Объект: {lead['object']}",
        f"Услуга: {lead['service']}",
        "",
        "Зона ответственности:",
        lead["responsibility"] or "— приложена файлом",
        "",
        "Документы:",
        *files_block(files, True),
    ]
    if not attach:
        lines += ["", "Файлы слишком большие для вложения — скачайте их по ссылкам выше."]
    who = lead["company"] or lead["name"]
    msg = MIMEMultipart()
    msg["Subject"] = Header(f"Заявка с сайта: {who}, {lead['phone']}", "utf-8")
    msg["From"] = sender
    msg["To"] = MAIL_TO
    msg["Reply-To"] = lead["email"]
    msg.attach(MIMEText("\n".join(lines), "plain", "utf-8"))
    if attach:
        for f in files:
            part = MIMEApplication(f["data"])
            part.add_header("Content-Disposition", "attachment", filename=("utf-8", "", f"{KINDS[f['kind']]} - {f['name']}"))
            msg.attach(part)
    smtp_send(sender, password, MAIL_TO, msg)
    print(f"company mail from {sender}, files: {len(files)}, attached: {attach}")
    return True


def send_client_mail(lead: dict, files: list) -> bool:
    sender, password = smtp_creds()
    if not sender:
        return False
    first = lead["name"].split(" ")[0]
    lines = [
        f"Здравствуйте, {first}!",
        "",
        "Мы получили вашу заявку и документы. Изучим их и свяжемся с вами в течение рабочего дня.",
        "",
        f"Объект: {lead['object']}",
        f"Услуга: {lead['service']}",
    ]
    if lead["company"]:
        lines.append(f"Компания: {lead['company']}")
    lines += ["", "Полученные документы:", *files_block(files, False)]
    if lead["responsibility"]:
        lines.append("Зона ответственности: описана текстом в заявке")
    lines += [
        "",
        "Если нужно что-то дополнить — просто ответьте на это письмо.",
        "",
        "С уважением,",
        "ХэвиПром",
        PHONE,
        MAIL_TO,
        "heavyprom.ru",
    ]
    msg = MIMEText("\n".join(lines), "plain", "utf-8")
    msg["Subject"] = Header("Заявка получена — ХэвиПром", "utf-8")
    msg["From"] = formataddr((str(Header("ХэвиПром", "utf-8")), sender))
    msg["To"] = lead["email"]
    msg["Reply-To"] = MAIL_TO
    smtp_send(sender, password, lead["email"], msg)
    print("client mail sent")
    return True


def handler(event: dict, context) -> dict:
    """Приём заявки с сайта: загрузка документов, сохранение в базу, письмо компании с вложениями и подтверждение клиенту."""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }
    if event.get("httpMethod") != "POST":
        return resp(405, {"error": "Метод не поддерживается"})

    try:
        data = json.loads(event.get("body") or "{}")
    except ValueError:
        return resp(400, {"error": "Некорректный запрос"})
    if not isinstance(data, dict):
        return resp(400, {"error": "Некорректный запрос"})
    if data.get("action") == "upload_chunk":
        return upload_chunk(data)
    if data.get("action") == "finish_file":
        return finish_file(data)

    lead = {
        "name": str(data.get("name", "")).strip()[:200],
        "phone": str(data.get("phone", "")).strip()[:50],
        "email": str(data.get("email", "")).strip()[:200],
        "company": str(data.get("company", "")).strip()[:300],
        "inn": re.sub(r"\D", "", str(data.get("inn", "")))[:12],
        "object": str(data.get("object", "")).strip()[:2000],
        "service": str(data.get("service", "")).strip()[:300],
        "responsibility": str(data.get("responsibility", "")).strip()[:5000],
    }
    raw_files = data.get("files") or []

    if (
        len(lead["name"]) < 2
        or len(re.sub(r"\D", "", lead["phone"])) != 11
        or not EMAIL_RE.match(lead["email"])
        or len(lead["object"]) < 3
        or not lead["service"]
    ):
        return resp(400, {"error": "Заполните все поля формы"})
    if lead["inn"] and len(lead["inn"]) not in (10, 12):
        return resp(400, {"error": "ИНН должен содержать 10 или 12 цифр"})
    if not isinstance(raw_files, list) or len(raw_files) > MAX_PER_KIND * len(KINDS):
        return resp(400, {"error": "Слишком много файлов"})
    kinds = [f.get("kind") for f in raw_files if isinstance(f, dict)]
    if any(kinds.count(k) > MAX_PER_KIND for k in KINDS):
        return resp(400, {"error": "Слишком много файлов в одном разделе"})
    if "tz" not in kinds or "contract" not in kinds or not (lead["responsibility"] or "responsibility" in kinds):
        return resp(400, {"error": "Приложите ТЗ, проект договора и укажите зону ответственности"})

    client = s3()
    files = []
    for f in raw_files:
        a = load_file(client, f) if isinstance(f, dict) else None
        if not a:
            return resp(400, {"error": "Не удалось принять файл"})
        files.append(a)
    if sum(f["size"] for f in files) > MAX_TOTAL:
        return resp(400, {"error": "Общий размер файлов больше 50 МБ"})

    sent = False
    try:
        sent = send_company_mail(lead, files)
    except Exception as e:
        print(f"company mail error: {e}")

    client_sent = False
    try:
        client_sent = send_client_mail(lead, files)
    except Exception as e:
        print(f"client mail error: {e}")

    meta = json.dumps([{k: f[k] for k in ("kind", "name", "size", "url")} for f in files], ensure_ascii=False)
    lead_id = None
    try:
        schema = os.environ.get("MAIN_DB_SCHEMA", "public")
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.leads (name, phone, email, company, inn, object_desc, service, email_sent, "
            f"client_email_sent, responsibility_text, files) VALUES ('{esc(lead['name'])}', '{esc(lead['phone'])}', "
            f"'{esc(lead['email'])}', '{esc(lead['company'])}', '{esc(lead['inn'])}', '{esc(lead['object'])}', "
            f"'{esc(lead['service'])}', {'TRUE' if sent else 'FALSE'}, {'TRUE' if client_sent else 'FALSE'}, "
            f"'{esc(lead['responsibility'])}', '{esc(meta)}'::jsonb) RETURNING id"
        )
        lead_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"db error: {e}")

    if not sent and lead_id is None:
        return resp(500, {"error": "Не удалось отправить заявку"})

    return resp(200, {"ok": True, "id": lead_id, "email_sent": sent, "client_email_sent": client_sent})
