from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
import os
import shutil
import datetime
import random
from typing import Optional, List
from pydantic import BaseModel

from config import settings
from database import (
    init_db,
    hash_password,
    get_user_by_identifier,
    save_new_user,
    save_complaint,
    get_complaint_by_id,
    list_complaints_filtered,
    update_complaint_record,
    get_stats_summary,
    fetch_recent_smtp_logs
)
from email_service import send_complaint_email, generate_complaint_email_html

# Initialize Database / Firebase
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    description="आपला दादा - लोकनेते मा. श्री. वैभव (दादा) पाटील नागरी तक्रार निवारण कक्ष",
    version="2.0.0"
)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "timestamp": datetime.datetime.now().isoformat()
    }

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media and built asset directories
FRONTEND_DIST = os.path.join(settings.BASE_DIR, "frontend", "dist")
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(FRONTEND_ASSETS):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="assets")
else:
    app.mount("/assets", StaticFiles(directory=settings.ASSETS_DIR), name="assets")

app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")

# Pydantic Models
class LoginRequest(BaseModel):
    username_or_mobile: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    mobile: str
    ward_village: str
    password: str
    email: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str
    admin_remarks: str

# ----------------- Dada's Development Works Data -----------------
DADA_WORKS = [
    {
        "id": 1,
        "title": "स्वच्छ व सुंदर विटा-खानापूर अभियान व नागरी पाहणी दौरा",
        "category": "स्वच्छता व नागरी सुविधा",
        "image": "/assets/media_1791609658536.jpg",
        "date": "ऑक्टोबर २०२५",
        "location": "विटा शहर मुख्य रस्ते व प्रभाग परिसर",
        "observation": "प्रभागातील रस्त्यांची प्रत्यक्ष पाहणी करताना मा. लोकनेते वैभव दादा. रस्त्यांची स्वच्छता, कचरा व्यवस्थापन आणि नागरी सुविधांची थेट जागेवर जाऊन पाहणी केली. नागरिकांशी थेट संवाद साधून त्यांच्या अडीअडचणी समजून घेतल्या व स्वच्छता कर्मचाऱ्यांना आधुनिक साधने आणि प्रोत्साहन दिले.",
        "highlights": [
            "नियमित रस्ते सफाई व गटार व्यवस्थापन",
            "कचराकुंडी मुक्त परिसर मोहीम",
            "प्रत्यक्ष जागेवर जाऊन नागरिकांच्या समस्यांचे तातडीने निराकरण"
        ]
    },
    {
        "id": 2,
        "title": "युवा सक्षमीकरण व राष्ट्रीय सेवा योजना (NSS) संवाद शिबीर",
        "category": "युवक सक्षमीकरण व शिक्षण",
        "image": "/assets/media_1791609658546.jpg",
        "date": "डिसेंबर २०२५",
        "location": "आदर्श इन्स्टिट्यूट ऑफ टेक्नॉलॉजी अँड रिसर्च सेंटर (AITRC), विटा",
        "observation": "आदर्श इन्स्टिट्यूट ऑफ टेक्नॉलॉजी (AITRC) विटा येथे राष्ट्रीय सेवा योजना शिबिरात युवक-विद्यार्थ्यांशी आत्मीय संवाद साधताना दादा. 'श्रमदान व राष्ट्रनिर्माणात तरुणांचा वाटा' या विषयावर मोलाचे मार्गदर्शन केले. विटा-खानापूरच्या युवा पिढीला स्वावलंबी आणि जागरूक बनवण्यासाठी निरंतर सहकार्य.",
        "highlights": [
            "तांत्रिक व उच्च शिक्षणासाठी विटा शहरात अद्ययावत सुविधा",
            "राष्ट्रीय सेवा योजना (NSS) उपक्रमांना सक्रीय पाठबळ",
            "ग्रामीण भागातील होतकरू विद्यार्थ्यांसाठी शिष्यवृत्ती व मार्गदर्शन"
        ]
    },
    {
        "id": 3,
        "title": "भव्य महाविद्यालयीन श्रमदान व पर्यावरण संवर्धन मोहीम",
        "category": "पर्यावरण व सामाजिक बांधिलकी",
        "image": "/assets/media_1791609658578.jpg",
        "date": "जानेवारी २०२६",
        "location": "विटा ग्रामीण परिसर व महाविद्यालय संकुल",
        "observation": "शेकडो महाविद्यालयीन तरुण-तरुणींच्या उपस्थितीत स्वच्छता मोहीम, वृक्षारोपण व श्रमदान अभियान. दादांच्या उपस्थितीत स्वयंसेवकांनी परिसरात स्वच्छता करून पर्यावरण रक्षणाची शपथ घेतली. समाजातील प्रत्येक घटकाला विकासाच्या प्रवाहात आणण्याचा दादांचा संकल्प.",
        "highlights": [
            "५००+ वृक्षारोपण व संवर्धन मोहीम",
            "स्वच्छता स्वयंसेवकांचा दादांच्या हस्ते गौरव",
            "ग्रामीण व शहरी भागात हरित पट्टा निर्मिती"
        ]
    },
    {
        "id": 4,
        "title": "राष्ट्रीय पातळीवर ऐतिहासिक गौरव - मा. राष्ट्रपती महोदयांच्या हस्ते विशेष सन्मान",
        "category": "राष्ट्रीय गौरव व सन्मान",
        "image": "/assets/media_1791609675057.jpg",
        "date": "विशेष राष्ट्रीय सन्मान सोहळा",
        "location": "नवी दिल्ली (राष्ट्रीय सोहळा)",
        "observation": "विटा-खानापूरच्या विकासातील भरीव योगदान आणि अविरत जनसेवेची राष्ट्रीय पातळीवर दखल! भारताचे तत्कालीन महामहीम राष्ट्रपती मा. रामनाथ कोविंद यांच्या शुभहस्ते नवी दिल्ली येथे विशेष राष्ट्रीय पुरस्कार व सन्मानपत्र स्वीकारताना मा. वैभव (दादा) पाटील आणि सहकारी.",
        "highlights": [
            "ग्रामीण विकास आणि लोककल्याणातील आदर्श नेतृत्व",
            "विटा-खानापूर मतदारसंघाचे नाव देशाच्या पटलावर सुवर्णाक्षरांनी",
            "जनतेच्या विश्वासाला आणि सेवेला मिळालेली सर्वोच्च पोचपावती"
        ]
    }
]

# ----------------- Authentication Routes -----------------
@app.post("/api/auth/login")
def login(req: LoginRequest):
    clean_username = req.username_or_mobile.strip()
    clean_password = req.password.strip()

    # Check if admin login
    if clean_username.lower() in ["admin", settings.ADMIN_USERNAME.lower()]:
        admin_user = get_user_by_identifier(settings.ADMIN_USERNAME)
        is_admin_valid = (
            clean_password == settings.ADMIN_PASSWORD
            or (admin_user and admin_user.get("password_hash") == hash_password(clean_password))
        )
        if is_admin_valid:
            return {
                "success": True,
                "role": "admin",
                "user": {
                    "id": admin_user.get("id", settings.ADMIN_USERNAME) if admin_user else settings.ADMIN_USERNAME,
                    "username": settings.ADMIN_USERNAME,
                    "full_name": admin_user.get("full_name", settings.ADMIN_NAME) if admin_user else settings.ADMIN_NAME,
                    "mobile": admin_user.get("mobile", "9822000000") if admin_user else "9822000000",
                    "role": "admin"
                }
            }
        else:
            raise HTTPException(status_code=401, detail="अवैध प्रशासक युझरनेम किंवा पासवर्ड.")

    # Citizen login by mobile or username
    user_record = get_user_by_identifier(clean_username)
    if user_record:
        if user_record.get("password_hash") == hash_password(clean_password):
            return {
                "success": True,
                "role": user_record.get("role", "client"),
                "user": {
                    "id": user_record.get("id"),
                    "username": user_record.get("username"),
                    "full_name": user_record.get("full_name"),
                    "mobile": user_record.get("mobile"),
                    "email": user_record.get("email", ""),
                    "ward_village": user_record.get("ward_village", ""),
                    "role": user_record.get("role", "client")
                }
            }
        else:
            raise HTTPException(status_code=401, detail="पासवर्ड चुकीचा आहे.")
    else:
        raise HTTPException(status_code=404, detail="हा मोबाईल क्रमांक किंवा नाव नोंदणीकृत नाही. कृपया प्रथम नवीन नोंदणी करा.")

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    if len(req.mobile.strip()) < 10:
        raise HTTPException(status_code=400, detail="कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.")

    # Check if mobile already exists
    existing_user = get_user_by_identifier(req.mobile.strip())
    if existing_user:
        raise HTTPException(status_code=400, detail="हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे. कृपया थेट लॉगिन करा.")
        
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    user_data = {
        "username": req.mobile.strip(),
        "password_hash": hash_password(req.password),
        "full_name": req.full_name.strip(),
        "mobile": req.mobile.strip(),
        "email": req.email.strip() if req.email else "",
        "ward_village": req.ward_village.strip(),
        "role": "client",
        "created_at": now_str
    }
    
    saved = save_new_user(user_data)
    return {
        "success": True,
        "message": "नोंदणी यशस्वीरीत्या पूर्ण झाली!",
        "user": {
            "id": saved.get("id"),
            "username": saved["username"],
            "full_name": saved["full_name"],
            "mobile": saved["mobile"],
            "email": saved.get("email", ""),
            "ward_village": saved.get("ward_village", ""),
            "role": "client"
        }
    }

# ----------------- Complaints (तक्रारी) Routes -----------------
@app.post("/api/complaints")
async def create_complaint(
    citizen_name: str = Form(...),
    citizen_phone: str = Form(...),
    citizen_email: Optional[str] = Form(""),
    category: str = Form(...),
    sub_category: Optional[str] = Form(""),
    ward_village: str = Form(...),
    address: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    priority: str = Form("सर्वसाधारण"),
    user_id: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    # Save photo if uploaded
    photo_url = ""
    if photo and photo.filename:
        filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{photo.filename.replace(' ', '_')}"
        file_path = os.path.join(settings.UPLOADS_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/uploads/{filename}"
        
    # Generate unique complaint ID: AD-YYYY-RANDOM
    random_digits = random.randint(1000, 9999)
    current_year = datetime.datetime.now().year
    complaint_id = f"AD-{current_year}-{random_digits}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    complaint_dict = {
        "id": complaint_id,
        "user_id": user_id or citizen_phone,
        "citizen_name": citizen_name.strip(),
        "citizen_phone": citizen_phone.strip(),
        "citizen_email": citizen_email.strip() if citizen_email else "",
        "category": category.strip(),
        "sub_category": sub_category.strip() if sub_category else "",
        "ward_village": ward_village.strip(),
        "address": address.strip(),
        "title": title.strip(),
        "description": description.strip(),
        "priority": priority,
        "photo_url": photo_url,
        "status": "प्रलंबित",
        "admin_remarks": "",
        "email_status": "pending",
        "created_at": now_str,
        "updated_at": now_str,
        "resolved_at": None
    }
    
    # Save complaint
    save_complaint(complaint_dict)
    
    # Trigger SMTP notification email to Vaibhav Dada's Office
    email_result = send_complaint_email(complaint_dict)
    
    return {
        "success": True,
        "message": "तक्रार यशस्वीरित्या नोंदवली गेली आहे. मा. वैभव दादांच्या जनसंपर्क कार्यालयास अधिकृत ईमेल सूचना पाठवली गेली आहे.",
        "complaint_id": complaint_id,
        "email_delivery": email_result,
        "complaint": complaint_dict
    }

@app.get("/api/complaints")
def list_complaints(
    user_id: Optional[str] = Query(None),
    citizen_phone: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    all_records: bool = Query(False)
):
    complaints = list_complaints_filtered(
        user_id=user_id,
        citizen_phone=citizen_phone,
        status=status,
        category=category,
        search=search,
        all_records=all_records
    )
    return {"complaints": complaints, "total": len(complaints)}

@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: str):
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="तक्रार सापडली नाही")
    return {"complaint": complaint}

@app.put("/api/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, req: StatusUpdateRequest):
    updated = update_complaint_record(complaint_id, req.status, req.admin_remarks)
    if not updated:
        raise HTTPException(status_code=404, detail="तक्रार सापडली नाही किंवा अपडेट करता आली नाही")
        
    return {
        "success": True,
        "message": f"तक्रार स्थिती यशस्वीरित्या '{req.status}' अशी अपडेट करण्यात आली!",
        "complaint": updated
    }

# ----------------- Dashboard Statistics -----------------
@app.get("/api/stats")
def get_stats():
    return get_stats_summary()

# ----------------- Dada's Works & Career Showcase -----------------
@app.get("/api/dada-works")
def get_dada_works():
    return {
        "works": DADA_WORKS,
        "leader": {
            "name": "मा. श्री. वैभव (दादा) पाटील",
            "title": "लोकनेते, विटा-खानापूर विधानसभा मतदारसंघ",
            "party": "भारतीय जनता पार्टी (BJP)",
            "logo": "/assets/media_1791609554510.png",
            "tagline": "जनसेवेसाठी सदैव तत्पर - आपला दादा, आपली ताकद!",
            "office_address": "मा. वैभव दादा पाटील जनसंपर्क कार्यालय, शिवाजी चौक, विटा - ४१५३११",
            "helpline": "०२३४७ २७०००० / +९१ ९८२२० ०००००"
        }
    }

# ----------------- SMTP Logs & Outbox -----------------
@app.get("/api/smtp-logs")
def get_smtp_logs():
    logs = fetch_recent_smtp_logs(50)
    return {"logs": logs}

@app.post("/api/complaints/{complaint_id}/resend-email")
def resend_complaint_email(complaint_id: str):
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="तक्रार सापडली नाही")
    result = send_complaint_email(complaint)
    return {
        "success": "DELIVERED" in result["status"],
        "delivery": result
    }

# ----------------- Static SPA Frontend Fallback -----------------
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("assets/") or full_path.startswith("uploads/"):
        raise HTTPException(status_code=404)
        
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
        
    return HTMLResponse(
        """
        <html>
        <head><title>आपला दादा पोर्टल</title><meta charset='utf-8'></head>
        <body style='font-family:sans-serif; text-align:center; padding:50px;'>
            <h2>आपला दादा नागरी तक्रार निवारण कक्ष - विटा खानापूर</h2>
            <p>पोर्टल लोड होत आहे...</p>
        </body>
        </html>
        """
    )
