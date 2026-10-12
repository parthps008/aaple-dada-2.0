import sys
import os
import json
import io
import datetime

# Setup path and UTF-8 encoding
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from starlette.testclient import TestClient
from main import app
from database import is_firebase_active, firestore_db, get_sqlite_conn
from config import settings

client = TestClient(app)

results = {
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "tests": []
}

def log_test(name, passed, detail="", is_warning=False):
    if passed:
        results["passed"] += 1
        print(f"  [PASS] {name}")
    elif is_warning:
        results["warnings"] += 1
        print(f"  [WARN] {name} -> {detail}")
    else:
        results["failed"] += 1
        print(f"  [FAIL] {name} -> {detail}")
    results["tests"].append({"name": name, "passed": passed, "warning": is_warning, "detail": detail})

print("=" * 60)
print("SENIOR QA & FUNCTIONAL AUDIT SUITE - AAPLA DADA PORTAL 2.0")
print("=" * 60)
print(f"Active Firebase Cloud: {is_firebase_active}")
print(f"Active Admin User: {settings.ADMIN_USERNAME}")
print("-" * 60)

# TEST 1: Health Check API
print("\n--- TEST GROUP 1: Core System & Health ---")
res = client.get("/api/health")
log_test("Health Check Endpoint (/api/health)", res.status_code == 200 and res.json().get("status") == "ok", res.text)

# TEST 2: Dada Works & Leader Profile
print("\n--- TEST GROUP 2: Dada's Works & Media Assets ---")
res = client.get("/api/dada-works")
if res.status_code == 200:
    data = res.json()
    works = data.get("works", [])
    leader = data.get("leader", {})
    has_4_works = len(works) >= 4
    has_leader_info = leader.get("name") and leader.get("logo")
    
    # Check if images actually exist on disk
    missing_assets = []
    if leader.get("logo"):
        logo_file = os.path.join("frontend", "dist", leader["logo"].lstrip("/"))
        if not os.path.exists(logo_file):
            logo_file = os.path.join(leader["logo"].lstrip("/"))
        if not os.path.exists(logo_file):
            missing_assets.append(f"Leader logo: {leader.get('logo')}")
            
    for w in works:
        img_path = w.get("image", "")
        if img_path:
            chk_file = os.path.join("frontend", "dist", img_path.lstrip("/"))
            if not os.path.exists(chk_file):
                chk_file = os.path.join(img_path.lstrip("/"))
            if not os.path.exists(chk_file):
                missing_assets.append(f"Work #{w.get('id')}: {img_path}")

    log_test("Dada Works API returns 4 development works", has_4_works, f"Found {len(works)} works")
    log_test("Leader profile contains logo and official details", bool(has_leader_info), str(leader))
    log_test("All work and logo images exist on disk", len(missing_assets) == 0, f"Missing: {missing_assets}")
else:
    log_test("Dada Works Endpoint (/api/dada-works)", False, res.text)

# TEST 3: Authentication - Admin Login
print("\n--- TEST GROUP 3: Authentication & Security ---")
# 3.1: Admin login exact
res = client.post("/api/auth/login", json={"username_or_mobile": "admin", "password": "dada@123"})
log_test("Admin Login (exact username)", res.status_code == 200 and res.json().get("role") == "admin", res.text)

# 3.2: Admin login case-insensitivity
res = client.post("/api/auth/login", json={"username_or_mobile": " Admin ", "password": "dada@123"})
log_test("Admin Login (case-insensitive & trimmed)", res.status_code == 200 and res.json().get("role") == "admin", res.text)

# 3.3: Admin login wrong password
res = client.post("/api/auth/login", json={"username_or_mobile": "admin", "password": "wrong_password"})
log_test("Admin Login Rejects Wrong Password", res.status_code == 401, f"Expected 401, got {res.status_code}")

# 3.4: Citizen Registration
test_phone = f"9822{datetime.datetime.now().strftime('%H%M%S')}"
reg_payload = {
    "full_name": "सचिन रमेश तेंडुलकर",
    "mobile": test_phone,
    "ward_village": "प्रभाग क्र. २ - विटा शहर",
    "password": "sachin@123",
    "email": "sachin@test.com"
}
res = client.post("/api/auth/register", json=reg_payload)
reg_ok = res.status_code == 200 and res.json().get("success") is True
log_test(f"Citizen Registration (Phone: {test_phone})", reg_ok, res.text)

# 3.5: Duplicate Registration Check
res = client.post("/api/auth/register", json=reg_payload)
log_test("Duplicate Mobile Registration Rejected (400)", res.status_code == 400, f"Expected 400, got {res.status_code}")

# 3.6: Short Mobile Validation Check
res = client.post("/api/auth/register", json={**reg_payload, "mobile": "9822"})
log_test("Short Mobile Number Validation Rejected (400)", res.status_code == 400, f"Expected 400, got {res.status_code}")

# 3.7: Citizen Login by Mobile
res = client.post("/api/auth/login", json={"username_or_mobile": test_phone, "password": "sachin@123"})
log_test("Citizen Login by Mobile Number", res.status_code == 200 and res.json().get("role") == "client", res.text)

# 3.8: Citizen Login by Full Name
res = client.post("/api/auth/login", json={"username_or_mobile": "सचिन रमेश तेंडुलकर", "password": "sachin@123"})
log_test("Citizen Login by Full Name", res.status_code == 200 and res.json().get("role") == "client", res.text)

# 3.9: Citizen Login with Wrong Password
res = client.post("/api/auth/login", json={"username_or_mobile": test_phone, "password": "wrongpassword"})
log_test("Citizen Login Rejects Wrong Password (401)", res.status_code == 401, f"Expected 401, got {res.status_code}")

# 3.10: Citizen Login Non-existent User
res = client.post("/api/auth/login", json={"username_or_mobile": "9999999999", "password": "any"})
log_test("Non-existent User Returns 404", res.status_code == 404, f"Expected 404, got {res.status_code}")

# TEST 4: Grievance (तक्रार) Filing
print("\n--- TEST GROUP 4: Grievance Lifecycle & Data Flow ---")
# 4.1: Submit complaint without photo
comp_payload = {
    "citizen_name": "सचिन रमेश तेंडुलकर",
    "citizen_phone": test_phone,
    "citizen_email": "sachin@test.com",
    "category": "रस्ते दुरुस्ती व खड्डे",
    "sub_category": "मुख्य डांबरी रस्ता",
    "ward_village": "प्रभाग क्र. २ - विटा शहर",
    "address": "शिवाजी चौक, विटा",
    "title": "मुख्य रस्त्यावर खड्डे पडले आहेत",
    "description": "पावसामुळे रस्त्याची दुरवस्था झाली असून वाहनांना धोका निर्माण झाला आहे.",
    "priority": "तातडीची",
    "user_id": test_phone
}
res = client.post("/api/complaints", data=comp_payload)
comp_ok = res.status_code == 200 and res.json().get("success") is True
created_comp = res.json().get("complaint", {})
created_id = created_comp.get("id", "")
log_test("File Complaint without Photo", comp_ok and bool(created_id), res.text)

# 4.2: Submit complaint with Photo file upload
photo_content = b"FAKE_JPEG_IMAGE_TEST_BYTES_FOR_UPLOAD"
photo_file = ("test_photo.jpg", io.BytesIO(photo_content), "image/jpeg")
comp_with_photo_payload = {
    **comp_payload,
    "title": "गटार तुंबले आहे आणि दुर्गंधी पसरली आहे",
    "category": "कचरा व स्वच्छता व्यवस्थापन"
}
res = client.post("/api/complaints", data=comp_with_photo_payload, files={"photo": photo_file})
comp_photo_ok = res.status_code == 200 and res.json().get("success") is True
created_photo_comp = res.json().get("complaint", {})
created_photo_id = created_photo_comp.get("id", "")
has_photo_url = bool(created_photo_comp.get("photo_url"))
log_test("File Complaint with Photo Upload", comp_photo_ok and has_photo_url, f"photo_url: {created_photo_comp.get('photo_url')}")

# 4.3: Verify Photo File Saved on Disk
if has_photo_url:
    disk_path = created_photo_comp["photo_url"].lstrip("/")
    log_test("Uploaded Photo File Exists on Disk", os.path.exists(disk_path), f"Disk path: {disk_path}")

# TEST 5: Complaints Querying & Filtering
print("\n--- TEST GROUP 5: Querying & Filtering ---")
# 5.1: Query by citizen_phone
res = client.get(f"/api/complaints?citizen_phone={test_phone}")
found_comps = res.json().get("complaints", [])
log_test(f"Query Complaints by Phone ({test_phone})", len(found_comps) >= 2, f"Found {len(found_comps)}")

# 5.2: Query by Complaint ID (Direct ID Lookup)
res = client.get(f"/api/complaints/{created_id}")
direct_comp = res.json().get("complaint", {})
log_test(f"Query Complaint by Specific ID ({created_id})", direct_comp.get("id") == created_id, res.text)

# 5.3: Query Non-existent Complaint ID (404)
res = client.get("/api/complaints/AD-9999-0000")
log_test("Query Non-existent Complaint ID Returns 404", res.status_code == 404, f"Status: {res.status_code}")

# 5.4: Admin All Records Query
res = client.get("/api/complaints?all_records=true")
all_comps = res.json().get("complaints", [])
log_test("Admin View All Records (all_records=true)", len(all_comps) >= len(found_comps), f"Total: {len(all_comps)}")

# 5.5: Search filter by Token ID
res = client.get(f"/api/complaints?all_records=true&search={created_id}")
search_comps = res.json().get("complaints", [])
log_test(f"Search Query by Token ID ({created_id})", any(c.get("id") == created_id for c in search_comps), f"Found {len(search_comps)}")

# TEST 6: Status Lifecycle & Admin Workflow
print("\n--- TEST GROUP 6: Admin Status Update Workflow ---")
# 6.1: Update to 'कार्य प्रगतीपथावर'
res = client.put(f"/api/complaints/{created_id}/status", json={
    "status": "कार्य प्रगतीपथावर",
    "admin_remarks": "संबंधित बांधकाम विभागास पाहणी करण्याचे आदेश दिले आहेत."
})
log_test("Admin Update Status to 'कार्य प्रगतीपथावर'", res.status_code == 200 and res.json().get("complaint", {}).get("status") == "कार्य प्रगतीपथावर", res.text)

# 6.2: Update to 'निकाली काढली (Done)'
res = client.put(f"/api/complaints/{created_id}/status", json={
    "status": "निकाली काढली",
    "admin_remarks": "रस्त्यावरील खड्डे डांबरीकरण करून दुरुस्त करण्यात आले आहेत. - दादांचे कार्यालय"
})
resolved_comp = res.json().get("complaint", {})
is_resolved = resolved_comp.get("status") == "निकाली काढली"
has_resolved_at = bool(resolved_comp.get("resolved_at"))
log_test("Admin Update Status to 'निकाली काढली' with resolved_at timestamp", is_resolved and has_resolved_at, f"resolved_at: {resolved_comp.get('resolved_at')}")

# 6.3: Verify Status Updated in Direct ID Query
res = client.get(f"/api/complaints/{created_id}")
refreshed_comp = res.json().get("complaint", {})
log_test("Re-queried Complaint Reflects 'निकाली काढली' Status", refreshed_comp.get("status") == "निकाली काढली" and refreshed_comp.get("admin_remarks") != "", str(refreshed_comp.get("admin_remarks")))

# 6.4: Update Status on Non-existent Complaint ID (404)
res = client.put("/api/complaints/AD-0000-0000/status", json={"status": "निकाली काढली", "admin_remarks": "None"})
log_test("Update Status on Non-existent ID Returns 404", res.status_code == 404, f"Status: {res.status_code}")

# TEST 7: Dashboard Statistics & KPIs
print("\n--- TEST GROUP 7: Analytics & KPI Stats ---")
res = client.get("/api/stats")
if res.status_code == 200:
    stats = res.json()
    has_keys = all(k in stats for k in ["total", "pending", "in_progress", "resolved", "categories"])
    total_matches = stats["total"] == (stats["pending"] + stats["in_progress"] + stats["resolved"])
    log_test("Stats API Structure Integrity", has_keys, str(stats))
    log_test("Stats Arithmetic Integrity (total == sum of status counts)", total_matches, f"Total: {stats.get('total')}, sum: {stats.get('pending', 0) + stats.get('in_progress', 0) + stats.get('resolved', 0)}")
else:
    log_test("Stats Endpoint (/api/stats)", False, res.text)

# TEST 8: SMTP Logs API
print("\n--- TEST GROUP 8: SMTP Email Logs & Transparency ---")
res = client.get("/api/smtp-logs")
if res.status_code == 200:
    smtp_logs = res.json().get("logs", [])
    log_test("SMTP Logs Endpoint (/api/smtp-logs)", isinstance(smtp_logs, list), f"Found {len(smtp_logs)} logs")
    if smtp_logs:
        sample_log = smtp_logs[0]
        has_log_fields = all(k in sample_log for k in ["complaint_id", "recipient", "subject", "status"])
        log_test("SMTP Log Entry Contains Complaint ID & Recipient", has_log_fields, str(sample_log.get("subject")))
else:
    log_test("SMTP Logs Endpoint", False, res.text)

# TEST 9: Static SPA Serving
print("\n--- TEST GROUP 9: Frontend Production Assets & Routing ---")
res = client.get("/")
log_test("SPA Root Route (/) serves 200 HTML", res.status_code == 200 and "text/html" in res.headers.get("content-type", ""), f"Status: {res.status_code}")

res = client.get("/admin")
log_test("SPA Deep Link (/admin) serves 200 HTML without 404", res.status_code == 200 and "text/html" in res.headers.get("content-type", ""), f"Status: {res.status_code}")

res = client.get("/works")
log_test("SPA Deep Link (/works) serves 200 HTML without 404", res.status_code == 200 and "text/html" in res.headers.get("content-type", ""), f"Status: {res.status_code}")

css_files = [f for f in os.listdir(os.path.join("frontend", "dist", "assets")) if f.endswith(".css")]
css_file = css_files[0] if css_files else "index.css"
res = client.get(f"/assets/{css_file}")
log_test(f"Static Asset CSS (/assets/{css_file}) loads with 200", res.status_code == 200, f"Status: {res.status_code}")

res = client.get("/api/non_existent_endpoint")
log_test("Non-existent API Route (/api/...) returns 404", res.status_code == 404, f"Status: {res.status_code}")

print("\n" + "=" * 60)
print(f"AUDIT SUMMARY: {results['passed']} PASSED, {results['failed']} FAILED, {results['warnings']} WARNINGS")
print("=" * 60)
