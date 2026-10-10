import os
import sys
import json
import sqlite3
import datetime
import hashlib
from typing import Optional, List, Dict, Any
from config import settings

# Global Firebase reference
firestore_db = None
is_firebase_active = False

def hash_password(password: str) -> str:
    salt = "aapla_dada_secure_salt_2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def init_firebase():
    global firestore_db, is_firebase_active
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if firebase_admin._apps:
            firestore_db = firestore.client()
            is_firebase_active = True
            return True

        cred = None
        # 1. Check if JSON string in env
        if settings.FIREBASE_CREDENTIALS_JSON and settings.FIREBASE_CREDENTIALS_JSON.strip():
            try:
                cert_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
                cred = credentials.Certificate(cert_dict)
            except Exception as e:
                print(f"[Firebase Config Error] Could not parse FIREBASE_CREDENTIALS_JSON: {e}")

        # 2. Check if file path exists
        elif os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)

        # 3. Check if project ID is provided
        elif settings.FIREBASE_PROJECT_ID:
            cred = credentials.ApplicationDefault()

        if cred:
            firebase_admin.initialize_app(cred, {
                'projectId': settings.FIREBASE_PROJECT_ID or None,
            })
            firestore_db = firestore.client()
            is_firebase_active = True
            print("============================================================")
            print("[SUCCESS] Firebase Cloud Credentials Loaded!")
            print("============================================================")
            return True
        else:
            print("[INFO] Firebase credentials not configured. Operating on local persistent storage.")
            return False

    except Exception as e:
        print(f"[Firebase Warning] {e}. Operating on local storage.")
        return False

# SQLite Helper
def get_sqlite_conn():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    init_firebase()
    
    # Always ensure SQLite schema is created as fallback / local backup
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT,
        ward_village TEXT,
        role TEXT DEFAULT 'client',
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        citizen_name TEXT NOT NULL,
        citizen_phone TEXT NOT NULL,
        citizen_email TEXT,
        category TEXT NOT NULL,
        sub_category TEXT,
        ward_village TEXT NOT NULL,
        address TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'सर्वसाधारण',
        photo_url TEXT,
        status TEXT DEFAULT 'प्रलंबित',
        admin_remarks TEXT DEFAULT '',
        email_status TEXT DEFAULT 'sent',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        resolved_at TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS smtp_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_html TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Seed Admin User in SQLite
    cursor.execute("SELECT id FROM users WHERE username = ?", (settings.ADMIN_USERNAME,))
    admin_user = cursor.fetchone()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not admin_user:
        cursor.execute("""
        INSERT INTO users (username, password_hash, full_name, mobile, email, ward_village, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'admin', ?)
        """, (
            settings.ADMIN_USERNAME,
            hash_password(settings.ADMIN_PASSWORD),
            settings.ADMIN_NAME,
            "9822000000",
            settings.ADMIN_EMAIL,
            "विटा मध्यवर्ती जनसंपर्क कार्यालय",
            now_str
        ))
    conn.commit()
    conn.close()

    # If Firebase active, attempt to sync admin
    if is_firebase_active and firestore_db:
        try:
            admin_ref = firestore_db.collection("users").document(settings.ADMIN_USERNAME)
            doc = admin_ref.get()
            if not doc.exists:
                admin_ref.set({
                    "id": settings.ADMIN_USERNAME,
                    "username": settings.ADMIN_USERNAME,
                    "password_hash": hash_password(settings.ADMIN_PASSWORD),
                    "full_name": settings.ADMIN_NAME,
                    "mobile": "9822000000",
                    "email": settings.ADMIN_EMAIL,
                    "ward_village": "विटा मध्यवर्ती जनसंपर्क कार्यालय",
                    "role": "admin",
                    "created_at": now_str
                })
                print(f"[SUCCESS] Admin account initialized in Firebase Firestore: {settings.ADMIN_USERNAME}")
        except Exception as e:
            print("[Firebase Notice] To enable cloud persistence, visit:")
            print("                  https://console.firebase.google.com/project/aaple-dada/firestore")
            print("                  Click 'Create database'. Operating on local database in the meantime.")

# ----------------- Unified DB Access Methods -----------------

def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    clean_id = (identifier or "").strip()
    if not clean_id:
        return None

    if is_firebase_active and firestore_db:
        try:
            # 1. Direct document lookup (username or mobile ID)
            doc = firestore_db.collection("users").document(clean_id).get()
            if doc.exists:
                return doc.to_dict()

            # 2. Lookup by mobile
            query_mob = firestore_db.collection("users").where("mobile", "==", clean_id).limit(1).stream()
            for d in query_mob:
                return d.to_dict()

            # 3. Lookup by full_name
            query_name = firestore_db.collection("users").where("full_name", "==", clean_id).limit(1).stream()
            for d in query_name:
                return d.to_dict()

            # 4. Lookup by email
            if "@" in clean_id:
                query_email = firestore_db.collection("users").where("email", "==", clean_id.lower()).limit(1).stream()
                for d in query_email:
                    return d.to_dict()

            # 5. Case-insensitive name or username scan
            all_users = firestore_db.collection("users").limit(100).stream()
            for d in all_users:
                u = d.to_dict()
                if u.get("full_name", "").strip().lower() == clean_id.lower():
                    return u
                if u.get("username", "").strip().lower() == clean_id.lower():
                    return u
        except Exception as e:
            print(f"[Firestore lookup notice]: {e}")

    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM users 
        WHERE username = ? 
           OR mobile = ? 
           OR LOWER(full_name) = LOWER(?) 
           OR (email != '' AND LOWER(email) = LOWER(?))
        LIMIT 1
    """, (clean_id, clean_id, clean_id, clean_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def save_new_user(user_dict: dict) -> Dict[str, Any]:
    # Always save to SQLite
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (username, password_hash, full_name, mobile, email, ward_village, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_dict["username"],
        user_dict["password_hash"],
        user_dict["full_name"],
        user_dict["mobile"],
        user_dict.get("email", ""),
        user_dict["ward_village"],
        user_dict.get("role", "client"),
        user_dict["created_at"]
    ))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    user_dict["id"] = user_id

    # And save to Firebase if active
    if is_firebase_active and firestore_db:
        try:
            username = user_dict["username"]
            doc_ref = firestore_db.collection("users").document(username)
            user_dict["id"] = username
            doc_ref.set(user_dict)
        except Exception:
            pass

    return user_dict

def save_complaint(complaint_dict: dict) -> Dict[str, Any]:
    # Always save to SQLite
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO complaints (
        id, user_id, citizen_name, citizen_phone, citizen_email, category, sub_category,
        ward_village, address, title, description, priority, photo_url, status,
        admin_remarks, email_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        complaint_dict["id"],
        str(complaint_dict.get("user_id", "")),
        complaint_dict["citizen_name"],
        complaint_dict["citizen_phone"],
        complaint_dict.get("citizen_email", ""),
        complaint_dict["category"],
        complaint_dict.get("sub_category", ""),
        complaint_dict["ward_village"],
        complaint_dict["address"],
        complaint_dict["title"],
        complaint_dict["description"],
        complaint_dict.get("priority", "सर्वसाधारण"),
        complaint_dict.get("photo_url", ""),
        complaint_dict.get("status", "प्रलंबित"),
        complaint_dict.get("admin_remarks", ""),
        complaint_dict.get("email_status", "pending"),
        complaint_dict["created_at"],
        complaint_dict["updated_at"]
    ))
    conn.commit()
    conn.close()

    # And save to Firebase
    if is_firebase_active and firestore_db:
        try:
            complaint_id = complaint_dict["id"]
            firestore_db.collection("complaints").document(complaint_id).set(complaint_dict)
        except Exception:
            pass

    return complaint_dict

def get_complaint_by_id(complaint_id: str) -> Optional[Dict[str, Any]]:
    if is_firebase_active and firestore_db:
        try:
            doc = firestore_db.collection("complaints").document(complaint_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception:
            pass

    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def list_complaints_filtered(
    user_id: Optional[str] = None,
    citizen_phone: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    all_records: bool = False
) -> List[Dict[str, Any]]:
    if is_firebase_active and firestore_db:
        try:
            query = firestore_db.collection("complaints")
            if not all_records:
                if citizen_phone:
                    query = query.where("citizen_phone", "==", citizen_phone)
                elif user_id:
                    query = query.where("user_id", "==", str(user_id))
            if status and status != "सर्व":
                query = query.where("status", "==", status)
            if category and category != "सर्व":
                query = query.where("category", "==", category)

            docs = query.stream()
            results = [d.to_dict() for d in docs]
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
            if search:
                s = search.lower()
                results = [
                    r for r in results 
                    if s in r.get("id", "").lower() 
                    or s in r.get("citizen_name", "").lower() 
                    or s in r.get("title", "").lower() 
                    or s in r.get("ward_village", "").lower() 
                    or s in r.get("description", "").lower()
                ]
            if results or not all_records:
                return results
        except Exception:
            pass

    conn = get_sqlite_conn()
    cursor = conn.cursor()
    sql = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if not all_records:
        if user_id:
            sql += " AND user_id = ?"
            params.append(str(user_id))
        elif citizen_phone:
            sql += " AND citizen_phone = ?"
            params.append(citizen_phone)

    if status and status != "सर्व":
        sql += " AND status = ?"
        params.append(status)

    if category and category != "सर्व":
        sql += " AND category = ?"
        params.append(category)

    if search:
        search_like = f"%{search}%"
        sql += " AND (id LIKE ? OR citizen_name LIKE ? OR title LIKE ? OR ward_village LIKE ? OR description LIKE ?)"
        params.extend([search_like, search_like, search_like, search_like, search_like])

    sql += " ORDER BY created_at DESC"
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_complaint_record(complaint_id: str, status: str, admin_remarks: str) -> Optional[Dict[str, Any]]:
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    resolved_at = now_str if status == "निकाली काढली" else None

    # Update in Firebase
    if is_firebase_active and firestore_db:
        try:
            doc_ref = firestore_db.collection("complaints").document(complaint_id)
            doc = doc_ref.get()
            if doc.exists:
                update_data = {
                    "status": status,
                    "admin_remarks": admin_remarks,
                    "updated_at": now_str
                }
                if resolved_at:
                    update_data["resolved_at"] = resolved_at
                doc_ref.update(update_data)
        except Exception:
            pass

    # Update in SQLite
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    if not cursor.fetchone():
        conn.close()
        return None

    cursor.execute("""
    UPDATE complaints 
    SET status = ?, admin_remarks = ?, updated_at = ?, resolved_at = COALESCE(?, resolved_at)
    WHERE id = ?
    """, (status, admin_remarks, now_str, resolved_at, complaint_id))
    conn.commit()

    cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    updated_row = cursor.fetchone()
    conn.close()
    return dict(updated_row) if updated_row else None

def get_stats_summary() -> Dict[str, Any]:
    if is_firebase_active and firestore_db:
        try:
            docs = list(firestore_db.collection("complaints").stream())
            total = len(docs)
            pending = 0
            in_progress = 0
            resolved = 0
            cat_map = {}

            for d in docs:
                data = d.to_dict()
                st = data.get("status")
                if st == "प्रलंबित":
                    pending += 1
                elif st in ("तपासणी सुरू", "कार्य प्रगतीपथावर"):
                    in_progress += 1
                elif st == "निकाली काढली":
                    resolved += 1

                cat = data.get("category", "इतर")
                cat_map[cat] = cat_map.get(cat, 0) + 1

            categories = [{"category": k, "count": v} for k, v in cat_map.items()]
            return {
                "total": total,
                "pending": pending,
                "in_progress": in_progress,
                "resolved": resolved,
                "categories": categories,
                "provider": "Firebase Cloud Firestore"
            }
        except Exception:
            pass

    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM complaints")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'प्रलंबित'")
    pending = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status IN ('तपासणी सुरू', 'कार्य प्रगतीपथावर')")
    in_progress = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'निकाली काढली'")
    resolved = cursor.fetchone()[0]

    cursor.execute("SELECT category, COUNT(*) as count FROM complaints GROUP BY category")
    categories = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "categories": categories,
        "provider": "Persistent Storage"
    }

def record_smtp_log(log_dict: dict):
    if is_firebase_active and firestore_db:
        try:
            firestore_db.collection("smtp_logs").add(log_dict)
        except Exception:
            pass

    try:
        conn = get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO smtp_logs (complaint_id, recipient, subject, body_html, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            log_dict.get("complaint_id", ""),
            log_dict.get("recipient", ""),
            log_dict.get("subject", ""),
            log_dict.get("body_html", ""),
            log_dict.get("status", ""),
            log_dict.get("created_at", "")
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print("Error recording SMTP log to SQLite:", e)

def fetch_recent_smtp_logs(limit: int = 50) -> List[Dict[str, Any]]:
    if is_firebase_active and firestore_db:
        try:
            docs = firestore_db.collection("smtp_logs").order_by("created_at", direction="DESCENDING").limit(limit).stream()
            res = [d.to_dict() for d in docs]
            if res:
                return res
        except Exception:
            pass

    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM smtp_logs ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
