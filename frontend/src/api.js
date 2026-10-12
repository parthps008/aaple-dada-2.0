// API client for Aapla Dada Portal
const API_BASE = "/api";

export async function loginApi(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "लॉगिन अयशस्वी झाले");
  return data;
}

export async function registerApi(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "नोंदणी अयशस्वी झाली");
  return data;
}

export async function submitComplaintApi(formData) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    body: formData, // FormData with photo file and fields
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "तक्रार नोंदवण्यात अडचण आली");
  return data;
}

export async function fetchComplaintsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.phone) query.append("citizen_phone", params.phone);
  if (params.userId) query.append("user_id", params.userId);
  if (params.status && params.status !== "सर्व") query.append("status", params.status);
  if (params.category && params.category !== "सर्व") query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  if (params.allRecords) query.append("all_records", "true");

  const res = await fetch(`${API_BASE}/complaints?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "तक्रारी लोड होऊ शकल्या नाहीत");
  return data;
}

export async function updateComplaintStatusApi(complaintId, status, adminRemarks) {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, admin_remarks: adminRemarks }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "स्थिती अपडेट करता आली नाही");
  return data;
}

export async function fetchStatsApi() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error("आकडेवारी लोड होऊ शकली नाही");
  return data;
}

export async function fetchDadaWorksApi() {
  const res = await fetch(`${API_BASE}/dada-works`);
  const data = await res.json();
  if (!res.ok) throw new Error("विकासकामे लोड होऊ शकली नाहीत");
  return data;
}

export async function fetchSmtpLogsApi() {
  const res = await fetch(`${API_BASE}/smtp-logs`);
  const data = await res.json();
  if (!res.ok) throw new Error("ईमेल लॉग लोड होऊ शकले नाहीत");
  return data;
}

export async function resendComplaintEmailApi(complaintId) {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/resend-email`, {
    method: "POST"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "ईमेल पाठवण्यात अडचण आली");
  return data;
}
