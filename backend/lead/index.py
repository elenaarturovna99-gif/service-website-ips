import json
import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header

import psycopg2

MAIL_TO = "info@heavyprom.ru"
MAIL_FROM = "heavyprom.ru@yandex.ru"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}


def resp(code: int, data: dict) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}


def esc(v: str) -> str:
    return v.replace("'", "''")


def send_mail(name: str, phone: str, obj: str, service: str) -> bool:
    password = os.environ.get("INFO_SMTP_PASSWORD")
    sender = MAIL_TO
    if not password:
        password = os.environ.get("SMTP_PASSWORD")
        sender = MAIL_FROM
    if not password:
        return False
    text = (
        f"Новая заявка с сайта heavyprom.ru\n\n"
        f"Имя: {name}\n"
        f"Телефон: {phone}\n"
        f"Объект: {obj}\n"
        f"Услуга: {service}\n"
    )
    msg = MIMEText(text, "plain", "utf-8")
    msg["Subject"] = Header(f"Заявка с сайта: {name}, {phone}", "utf-8")
    msg["From"] = sender
    msg["To"] = MAIL_TO
    try:
        with smtplib.SMTP_SSL("smtp.yandex.ru", 465, timeout=3) as s:
            s.login(sender, password)
            s.sendmail(sender, [MAIL_TO], msg.as_string())
    except (ConnectionRefusedError, OSError) as e:
        if isinstance(e, smtplib.SMTPException):
            raise
        print(f"smtp 465 failed: {e}, trying 587")
        with smtplib.SMTP("smtp.yandex.ru", 587, timeout=3) as s:
            s.starttls()
            s.login(sender, password)
            s.sendmail(sender, [MAIL_TO], msg.as_string())
    print(f"mail from {sender}")
    return True


def handler(event: dict, context) -> dict:
    """Приём заявки с сайта: сохраняет в базу и отправляет письмо на почту компании."""
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

    data = json.loads(event.get("body") or "{}")
    name = str(data.get("name", "")).strip()[:200]
    phone = str(data.get("phone", "")).strip()[:50]
    obj = str(data.get("object", "")).strip()[:2000]
    service = str(data.get("service", "")).strip()[:300]

    if len(name) < 2 or len("".join(c for c in phone if c.isdigit())) != 11 or len(obj) < 3 or not service:
        return resp(400, {"error": "Заполните все поля формы"})

    sent = False
    try:
        sent = send_mail(name, phone, obj, service)
        print(f"mail sent: {sent}")
    except Exception as e:
        print(f"mail error: {e}")

    lead_id = None
    try:
        schema = os.environ.get("MAIN_DB_SCHEMA", "public")
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.leads (name, phone, object_desc, service, email_sent) "
            f"VALUES ('{esc(name)}', '{esc(phone)}', '{esc(obj)}', '{esc(service)}', {'TRUE' if sent else 'FALSE'}) RETURNING id"
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