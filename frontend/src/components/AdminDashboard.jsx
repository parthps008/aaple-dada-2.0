import React, { useState, useEffect } from "react";
import { 
  fetchComplaintsApi, 
  updateComplaintStatusApi, 
  fetchStatsApi,
  fetchSmtpLogsApi 
} from "../api";
import { 
  Shield, 
  Clock, 
  RotateCw, 
  Search, 
  Mail, 
  CheckCheck, 
  Edit3, 
  Phone, 
  MapPin, 
  X,
  FileCheck2,
  Database,
  Activity,
  Calendar
} from "lucide-react";

export default function AdminDashboard({ onOpenEmailPreview }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, provider: "" });
  const [smtpLogs, setSmtpLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("complaints");
  
  const [statusFilter, setStatusFilter] = useState("सर्व");
  const [categoryFilter, setCategoryFilter] = useState("सर्व");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("निकाली काढली");
  const [newRemarks, setNewRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [compRes, statsRes, logsRes] = await Promise.all([
        fetchComplaintsApi({
          allRecords: true,
          status: statusFilter,
          category: categoryFilter,
          search: searchQuery
        }),
        fetchStatsApi(),
        fetchSmtpLogsApi()
      ]);
      setComplaints(compRes.complaints || []);
      setStats(statsRes);
      setSmtpLogs(logsRes.logs || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dynamic admin data fetch error:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, [statusFilter, categoryFilter]);

  // Dynamic Polling every 10 seconds for real-time live entries
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleOpenEdit = (comp) => {
    setEditingComplaint(comp);
    setNewStatus(comp.status === "निकाली काढली" ? "निकाली काढली" : "निकाली काढली");
    setNewRemarks(comp.admin_remarks || "मा. वैभव दादांच्या सूचनेनुसार प्रत्यक्ष कार्यवाही पूर्ण झाली असून तक्रार निकाली काढण्यात आली आहे.");
    setActionSuccessMsg("");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setUpdating(true);
    try {
      await updateComplaintStatusApi(editingComplaint.id, newStatus, newRemarks);
      setActionSuccessMsg(`तक्रार #${editingComplaint.id} यशस्वीरीत्या '${newStatus}' अशी अद्ययावत करण्यात आली.`);
      setTimeout(() => {
        setEditingComplaint(null);
        loadData(false);
      }, 1000);
    } catch (err) {
      alert("अपडेट करताना त्रुटी आली: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const quickRemarkTemplates = [
    "मा. वैभव दादांच्या सूचनेनुसार प्रत्यक्ष डांबरीकरण काम पूर्ण झाले असून रस्ता दुरुस्त करण्यात आला आहे.",
    "जलवाहिनी गळती दुरुस्त करण्यात आली असून पिण्याच्या पाण्याचा पुरवठा सुरळीत सुरू झाला आहे.",
    "नवीन एलईडी पथदिवे बसवून प्रकाश व्यवस्था पूर्ववत करण्यात आली आहे.",
    "परिसरातील कचराकुंडी व गटारांची संपूर्ण स्वच्छता पूर्ण करण्यात आली आहे.",
    "संबंधित शासकीय योजनेच्या लाभासाठी अर्ज मंजूर करून पुढील कार्यवाही पूर्ण केली आहे."
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 pb-20">
      {/* Full Widescreen Executive Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-md mb-6 relative overflow-hidden border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  प्रशासकीय नियंत्रण कक्ष (Executive Command Center)
                </h2>
                <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30">
                  कार्यालयीन पोर्टल
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय • तक्रार पडताळणी व थेट निवारण कक्ष
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Database className="w-4 h-4 text-orange-400" />
              <span>डेटाबेस: <strong>{stats.provider || "Firebase Cloud"}</strong></span>
            </div>
            <button
              onClick={() => loadData(false)}
              disabled={loading}
              className="btn-press bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>लाईव्ह रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Widescreen Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
            <span className="text-xs text-slate-400 font-medium block">एकूण दाखल तक्रारी</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.total}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
            <span className="text-xs text-slate-400 font-medium block">प्रलंबित (Pending)</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pending}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-center">
            <span className="text-xs text-slate-400 font-medium block">काम सुरू (In Progress)</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-400">{stats.in_progress}</span>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-3.5 text-center">
            <span className="text-xs text-emerald-400 font-medium block">निकाली काढल्या (Done)</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 mb-5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("complaints")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubTab === "complaints"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>तक्रारी व्यवस्थापन ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("emails")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeSubTab === "emails"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>SMTP ईमेल आउटबॉक्स ({smtpLogs.length})</span>
        </button>
      </div>

      {activeSubTab === "complaints" ? (
        <>
          {/* Full Widescreen Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="तक्रार क्र., नाव, पत्ता किंवा विषय शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadData(false)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none bg-white font-medium"
                >
                  <option value="सर्व">सर्व स्थिती (All Status)</option>
                  <option value="प्रलंबित">प्रलंबित (Pending)</option>
                  <option value="तपासणी सुरू">तपासणी सुरू (Under Review)</option>
                  <option value="कार्य प्रगतीपथावर">कार्य प्रगतीपथावर (In Progress)</option>
                  <option value="निकाली काढली">निकाली काढली (Done)</option>
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none bg-white font-medium"
                >
                  <option value="सर्व">सर्व प्रवर्ग</option>
                  <option value="रस्ते दुरुस्ती व खड्डे">रस्ते दुरुस्ती व खड्डे</option>
                  <option value="पाणी पुरवठा व गळती">पाणी पुरवठा व गळती</option>
                  <option value="नगरपालिका/ग्रामपंचायत">नगरपालिका / ग्रामपंचायत</option>
                  <option value="वीज पुरवठा व पथदिवे">वीज पुरवठा व पथदिवे</option>
                  <option value="शासकीय योजना">शासकीय योजना लाभ</option>
                  <option value="कचरा व स्वच्छता">कचरा व स्वच्छता</option>
                  <option value="इतर सार्वजनिक समस्या">इतर समस्या</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Widescreen Complaints Feed */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 shadow-xs">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-semibold">तक्रारींचा लाईव्ह डेटा लोड होत आहे...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <p className="text-xs text-slate-500">कोणतीही तक्रार आढळली नाही.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => {
                const isResolved = comp.status === "निकाली काढली";
                return (
                  <div
                    key={comp.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      isResolved
                        ? "border-emerald-300 bg-emerald-50/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                          #{comp.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                          {comp.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.priority === "अतितातडीची" 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : comp.priority === "तातडीची" 
                              ? "bg-amber-50 text-amber-800 border border-amber-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {comp.priority}
                        </span>
                      </div>

                      <div>
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-400 font-bold text-xs px-2.5 py-0.5 rounded-full">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>निकाली काढली (Done)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{comp.status}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                      {comp.title}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 mb-3">
                      <div>
                        <span className="text-slate-400">तक्रारदार:</span>{" "}
                        <strong className="text-slate-800">{comp.citizen_name}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-orange-600" />
                        <a href={`tel:${comp.citizen_phone}`} className="text-orange-700 font-bold hover:underline">
                          {comp.citizen_phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>{comp.ward_village}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 mb-3">
                      "{comp.description}"
                    </p>

                    {comp.admin_remarks && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950 mb-3">
                        <span className="font-bold block text-emerald-800 mb-0.5">
                          कार्यालयीन कृती शेरा:
                        </span>
                        {comp.admin_remarks}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>नोंदणी: {comp.created_at}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenEmailPreview(comp)}
                          className="btn-press bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                          title="या तक्रारीची ईमेल सूचना पहा"
                        >
                          <Mail className="w-3.5 h-3.5 text-orange-600" />
                          <span>ईमेल टेम्पलेट</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(comp)}
                          className="btn-press bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>स्थिती बदला / निकाली काढा</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* SMTP Outbox Sub-Tab */
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
            <strong>SMTP ईमेल सूचना अहवाल:</strong> नवीन तक्रार दाखल होताच मा. वैभव दादांच्या जनसंपर्क कार्यालयास (sagareparth@gmail.com) पाठवलेल्या सर्व ईमेल सूचनांची नोंद येथे दिसते.
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {smtpLogs.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">कोणतेही ईमेल नोंदी उपलब्ध नाहीत.</div>
            ) : (
              smtpLogs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        #{log.complaint_id}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {log.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {log.created_at}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {log.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      प्राप्तकर्ता: <strong>{log.recipient}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenEmailPreview({ id: log.complaint_id, body_html: log.body_html, title: log.subject })}
                    className="btn-press bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>ईमेल मजकूर पहा</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  #{editingComplaint.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  तक्रार स्थिती अद्ययावत करा
                </h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-400 p-4 rounded-xl text-center text-emerald-800 font-bold text-xs animate-fadeIn">
                <CheckCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                {actionSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveStatus} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सद्यस्थिती निवडा <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="निकाली काढली">निकाली काढली (Done / Resolved)</option>
                    <option value="कार्य प्रगतीपथावर">कार्य प्रगतीपथावर (In Progress)</option>
                    <option value="तपासणी सुरू">तपासणी सुरू (Under Review)</option>
                    <option value="प्रलंबित">प्रलंबित (Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कार्यालयीन निवारण शेरा (नागरिकाच्या डॅशबोर्डवर दिसणारा अधिकृत संदेश)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    placeholder="उदा. मा. वैभव दादांच्या सूचनेनुसार प्रत्यक्ष डांबरीकरण काम पूर्ण झाले आहे."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  ></textarea>
                </div>

                {/* Suggestions */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    पर्यायी तयार शेरे:
                  </span>
                  <div className="space-y-1">
                    {quickRemarkTemplates.slice(0, 3).map((tmp, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setNewRemarks(tmp)}
                        className="text-[11px] text-left text-slate-600 hover:text-orange-700 hover:bg-orange-50 p-1.5 rounded-lg border border-slate-100 w-full block transition-colors"
                      >
                        • {tmp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-press flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {updating ? "अद्ययावत करत आहे..." : "स्थिती अद्ययावत करा व जतन करा"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(null)}
                    className="btn-press px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    रद्द करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
