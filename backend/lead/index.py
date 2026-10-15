import base64
import json
import os
import re
import smtplib
from datetime import datetime
from email.header import Header
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import boto3
import psycopg2
from botocore.exceptions import ClientError

MAIL_TO = "info@heavyprom.ru"
MAIL_FROM = "heavyprom.ru@yandex.ru"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}
KINDS = {"tz": "Техническое задание", "contract": "Проект договора", "responsibility": "Зона ответственности"}
ALLOWED_EXT = {"pdf", "doc", "docx", "xls", "xlsx", "rtf", "odt", "txt", "zip", "rar", "7z", "jpg", "jpeg", "png", "dwg"}
MAX_FILE = 10 * 1024 * 1024
MAX_PARTS = 8
MAX_CHUNK = 2 * 1024 * 1024
ATTACH_LIMIT = 15 * 1024 * 1024
UID_RE = re.compile(r"^[a-f0-9]{32}$")


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


def assemble(client, f: dict):
    uid = str(f.get("upload_id", ""))
    kind = str(f.get("kind", ""))
    parts = f.get("parts")
    name = clean_name(str(f.get("name", "")))
    ext = ext_of(name)
    if not UID_RE.match(uid) or kind not in KINDS or not isinstance(parts, int) or not 1 <= parts <= MAX_PARTS or ext not in ALLOWED_EXT:
        return None
    try:
        body = b"".join(
            client.get_object(Bucket="files", Key=f"leads/tmp/{uid}/{i}")["Body"].read() for i in range(parts)
        )
    except ClientError:
        return None
    if len(body) > MAX_FILE:
        return None
    key = f"leads/{datetime.now():%Y-%m}/{uid}.{ext}"
    client.put_object(Bucket="files", Key=key, Body=body, ContentDisposition="attachment")
    for i in range(parts):
        try:
            client.delete_object(Bucket="files", Key=f"leads/tmp/{uid}/{i}")
        except ClientError as e:
            print(f"tmp cleanup failed: {e}")
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return {"kind": kind, "name": name, "size": len(body), "url": url, "data": body}


def send_mail(name: str, phone: str, obj: str, service: str, resp_text: str, files: list) -> bool:
    password = os.environ.get("INFO_SMTP_PASSWORD")
    sender = MAIL_TO
    if not password:
        password = os.environ.get("SMTP_PASSWORD")
        sender = MAIL_FROM
    if not password:
        return False
    attach = sum(f["size"] for f in files) <= ATTACH_LIMIT
    lines = [
        "Новая заявка с сайта heavyprom.ru",
        "",
        f"Имя: {name}",
        f"Телефон: {phone}",
        f"Объект: {obj}",
        f"Услуга: {service}",
        "",
        "Зона ответственности:",
        resp_text or "— приложена файлом",
        "",
        "Документы:",
    ]
    for f in files:
        lines.append(f"• {KINDS[f['kind']]}: {f['name']} ({f['size'] / 1024 / 1024:.1f} МБ)")
        lines.append(f"  {f['url']}")
    if not attach:
        lines += ["", "Файлы слишком большие для вложения — скачайте их по ссылкам выше."]
    msg = MIMEMultipart()
    msg["Subject"] = Header(f"Заявка с сайта: {name}, {phone}", "utf-8")
    msg["From"] = sender
    msg["To"] = MAIL_TO
    msg.attach(MIMEText("\n".join(lines), "plain", "utf-8"))
    if attach:
        for f in files:
            part = MIMEApplication(f["data"])
            part.add_header("Content-Disposition", "attachment", filename=("utf-8", "", f"{KINDS[f['kind']]} - {f['name']}"))
            msg.attach(part)
    raw = msg.as_string()
    try:
        with smtplib.SMTP_SSL("smtp.yandex.ru", 465, timeout=20) as s:
            s.login(sender, password)
            s.sendmail(sender, [MAIL_TO], raw)
    except (ConnectionRefusedError, OSError) as e:
        if isinstance(e, smtplib.SMTPException):
            raise
        print(f"smtp 465 failed: {e}, trying 587")
        with smtplib.SMTP("smtp.yandex.ru", 587, timeout=20) as s:
            s.starttls()
            s.login(sender, password)
            s.sendmail(sender, [MAIL_TO], raw)
    print(f"mail from {sender}, files: {len(files)}, attached: {attach}")
    return True


def handler(event: dict, context) -> dict:
    """Приём заявки с сайта: загрузка документов частями, сохранение в базу и отправка письма с вложениями на почту компании."""
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

    name = str(data.get("name", "")).strip()[:200]
    phone = str(data.get("phone", "")).strip()[:50]
    obj = str(data.get("object", "")).strip()[:2000]
    service = str(data.get("service", "")).strip()[:300]
    resp_text = str(data.get("responsibility", "")).strip()[:5000]
    raw_files = data.get("files") or []

    if len(name) < 2 or len("".join(c for c in phone if c.isdigit())) != 11 or len(obj) < 3 or not service:
        return resp(400, {"error": "Заполните все поля формы"})
    if not isinstance(raw_files, list) or len(raw_files) > 3:
        return resp(400, {"error": "Некорректные файлы"})
    kinds = {f.get("kind") for f in raw_files if isinstance(f, dict)}
    if "tz" not in kinds or "contract" not in kinds or not (resp_text or "responsibility" in kinds):
        return resp(400, {"error": "Приложите ТЗ, проект договора и укажите зону ответственности"})

    client = s3()
    files = []
    for f in raw_files:
        a = assemble(client, f) if isinstance(f, dict) else None
        if not a:
            return resp(400, {"error": "Не удалось принять файл"})
        files.append(a)

    sent = False
    try:
        sent = send_mail(name, phone, obj, service, resp_text, files)
        print(f"mail sent: {sent}")
    except Exception as e:
        print(f"mail error: {e}")

    meta = json.dumps([{k: f[k] for k in ("kind", "name", "size", "url")} for f in files], ensure_ascii=False)
    lead_id = None
    try:
        schema = os.environ.get("MAIN_DB_SCHEMA", "public")
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.leads (name, phone, object_desc, service, email_sent, responsibility_text, files) "
            f"VALUES ('{esc(name)}', '{esc(phone)}', '{esc(obj)}', '{esc(service)}', {'TRUE' if sent else 'FALSE'}, "
            f"'{esc(resp_text)}', '{esc(meta)}'::jsonb) RETURNING id"
        )
        lead_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"db error: {e}")

    if not sent and lead_id is None:
        return resp(500, {"error": "Не удалось отправить заявку"})

    return resp(200, {"ok": True, "id": lead_id, "email_sent": sent})