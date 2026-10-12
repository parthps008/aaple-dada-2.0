import smtplib
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime
from config import settings
from database import record_smtp_log

def generate_complaint_email_html(complaint_data: dict) -> str:
    priority_color = "#dc2626" if complaint_data.get("priority") == "अतितातडीची" else ("#ea580c" if complaint_data.get("priority") == "तातडीची" else "#2563eb")
    
    html = f"""<!DOCTYPE html>
<html lang="mr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
        .container {{ max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }}
        .header {{ background: linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%); color: #ffffff; padding: 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }}
        .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.95; }}
        .badge-bar {{ display: flex; justify-content: space-between; align-items: center; background: #fff7ed; padding: 12px 24px; border-bottom: 1px solid #fed7aa; }}
        .token {{ font-weight: 800; color: #c2410c; font-size: 15px; font-family: monospace; }}
        .priority {{ background-color: {priority_color}; color: #ffffff; padding: 3px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; }}
        .content {{ padding: 24px; }}
        .section-title {{ font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 18px; margin-bottom: 10px; border-bottom: 2px solid #ea580c; padding-bottom: 3px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }}
        .info-table td {{ padding: 7px 0; }}
        .info-label {{ color: #64748b; width: 34%; font-weight: 500; }}
        .info-value {{ font-weight: 600; color: #0f172a; }}
        .desc-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #ea580c; border-radius: 8px; padding: 14px 16px; margin: 12px 0 20px; }}
        .desc-text {{ font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap; }}
        .btn-container {{ text-align: center; margin: 24px 0 12px; }}
        .action-btn {{ background: #ea580c; color: #ffffff !important; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25); }}
        .footer {{ background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>आपला दादा - नागरी तक्रार निवारण पोर्टल</h1>
            <p>लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय, विटा-खानापूर</p>
        </div>
        
        <div class="badge-bar">
            <span class="token">तक्रार क्र.: #{complaint_data.get('id')}</span>
            <span class="priority">प्राधान्य: {complaint_data.get('priority', 'सर्वसाधारण')}</span>
        </div>
        
        <div class="content">
            <p style="font-size: 13px; color: #475569; margin-top: 0; line-height: 1.5;">
                मा. वैभव दादा पाटील यांच्या कार्यालयास कळविण्यात येते की, <strong>{complaint_data.get('citizen_name')}</strong> यांनी पोर्टलवर नवीन नागरी तक्रार नोंदवली आहे.
            </p>
            
            <div class="section-title">नागरिकाचा संपर्क तपशील</div>
            <table class="info-table">
                <tr>
                    <td class="info-label">तक्रारदाराचे नाव:</td>
                    <td class="info-value">{complaint_data.get('citizen_name')}</td>
                </tr>
                <tr>
                    <td class="info-label">मोबाईल क्रमांक:</td>
                    <td class="info-value"><a href="tel:{complaint_data.get('citizen_phone')}" style="color: #ea580c; text-decoration: none;">{complaint_data.get('citizen_phone')}</a></td>
                </tr>
                <tr>
                    <td class="info-label">ईमेल पत्ता:</td>
                    <td class="info-value">{complaint_data.get('citizen_email') or 'उपलब्ध नाही'}</td>
                </tr>
                <tr>
                    <td class="info-label">गाव / प्रभाग / परिसर:</td>
                    <td class="info-value">{complaint_data.get('ward_village')}</td>
                </tr>
                <tr>
                    <td class="info-label">अचूक पत्ता / खूण:</td>
                    <td class="info-value">{complaint_data.get('address')}</td>
                </tr>
            </table>

            <div class="section-title">तक्रारीचा तपशील</div>
            <div style="background: #fff7ed; padding: 10px 14px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #fed7aa;">
                <div style="font-size: 12px; color: #c2410c; font-weight: 700; margin-bottom: 2px;">प्रवर्ग: {complaint_data.get('category')}</div>
                <div style="font-size: 15px; font-weight: 700; color: #0f172a;">{complaint_data.get('title')}</div>
            </div>

            <div class="desc-box">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">नागरिकाचे म्हणणे:</div>
                <div class="desc-text">{complaint_data.get('description')}</div>
            </div>

            <div class="btn-container">
                <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">ही तक्रार तपासून संबंधित विभागाकडून काम पूर्ण झाल्यावर पोर्टलवर 'निकाली काढली (Done)' अशी नोंद करावी.</p>
                <a href="{settings.BASE_URL}" class="action-btn">प्रशासकीय पोर्टलवर तक्रार पहा व निकाली काढा</a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600;">लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय, विटा-खानापूर</p>
            <p style="margin: 4px 0 0;">स्वयंचलित प्रणालीद्वारे पाठवण्यात आलेली अधिकृत सूचना | दिनांक: {datetime.datetime.now().strftime("%d-%m-%Y %I:%M %p")}</p>
        </div>
    </div>
</body>
</html>
"""
    return html

def send_complaint_email(complaint_data: dict) -> dict:
    recipient = settings.OFFICE_NOTIFICATION_EMAIL or settings.ADMIN_EMAIL
    subject = f"[आपला दादा पोर्टल] नवीन तक्रार #{complaint_data.get('id')} - {complaint_data.get('category')} ({complaint_data.get('ward_village')})"
    body_html = generate_complaint_email_html(complaint_data)
    
    delivery_status = "SAVED_OUTBOX"
    error_message = None

    # 1. Option 1: Resend HTTP Email API (Runs over Port 443 HTTPS - Never blocked by Render!)
    if settings.RESEND_API_KEY and settings.RESEND_API_KEY.strip():
        try:
            res = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Aapla Dada Office <onboarding@resend.dev>",
                    "to": [recipient],
                    "subject": subject,
                    "html": body_html
                },
                timeout=12
            )
            if res.status_code in (200, 201):
                delivery_status = "DELIVERED_RESEND"
            else:
                error_message = f"Resend API ({res.status_code}): {res.text}"
                delivery_status = f"FAILED_RESEND: {error_message}"
        except Exception as e:
            error_message = f"Resend exception: {e}"
            delivery_status = f"FAILED_RESEND: {error_message}"

    # 2. Option 2: Brevo (Sendinblue) HTTP Email API (Runs over Port 443 HTTPS)
    elif settings.BREVO_API_KEY and settings.BREVO_API_KEY.strip():
        try:
            res = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": settings.BREVO_API_KEY.strip(),
                    "Content-Type": "application/json"
                },
                json={
                    "sender": {"name": settings.SMTP_FROM_NAME, "email": settings.SMTP_FROM_EMAIL or recipient},
                    "to": [{"email": recipient}],
                    "subject": subject,
                    "htmlContent": body_html
                },
                timeout=12
            )
            if res.status_code in (200, 201):
                delivery_status = "DELIVERED_BREVO"
            else:
                error_message = f"Brevo API ({res.status_code}): {res.text}"
                delivery_status = f"FAILED_BREVO: {error_message}"
        except Exception as e:
            error_message = f"Brevo exception: {e}"
            delivery_status = f"FAILED_BREVO: {error_message}"

    # 3. Option 3: Standard SMTP (Gmail / Custom SMTP server)
    elif settings.SMTP_USER and settings.SMTP_PASSWORD and settings.SMTP_HOST:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = recipient
            msg.attach(MIMEText(body_html, "html", "utf-8"))
            
            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                server.starttls()
                
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [recipient], msg.as_string())
            server.quit()
            delivery_status = "DELIVERED_SMTP"
        except Exception as e:
            error_message = str(e)
            if "101" in error_message or "unreachable" in error_message.lower():
                delivery_status = "RENDER_FREE_FIREWALL: Render blocks outbound SMTP port 587. Add RESEND_API_KEY in Render to send via HTTPS."
            else:
                delivery_status = f"FAILED_SMTP: {error_message}"
    else:
        delivery_status = "SAVED_OUTBOX"
        
    # Log in database / Firebase Firestore
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record_smtp_log({
        "complaint_id": complaint_data.get("id"),
        "recipient": recipient,
        "subject": subject,
        "body_html": body_html,
        "status": delivery_status,
        "created_at": now_str
    })
        
    return {
        "status": delivery_status,
        "recipient": recipient,
        "subject": subject,
        "error": error_message
    }
