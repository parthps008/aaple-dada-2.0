import React, { useState, useEffect, useRef } from "react";
import { fetchComplaintsApi } from "../api";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RotateCw, 
  Calendar, 
  MapPin, 
  Phone, 
  Eye, 
  X,
  CheckCheck,
  FileSearch,
  MailCheck,
  Activity,
  Layers
} from "lucide-react";

export default function MyComplaints({ currentUser, initialSearchId }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState(currentUser?.mobile || "");
  const [searchQuery, setSearchQuery] = useState(initialSearchId || "");
  const [statusFilter, setStatusFilter] = useState("सर्व");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const loadComplaints = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await fetchComplaintsApi({
        phone: currentUser?.role === "admin" ? null : (searchPhone || null),
        allRecords: currentUser?.role === "admin" ? true : (!searchPhone && !currentUser),
        status: statusFilter,
        search: searchQuery
      });
      setComplaints(data.complaints || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dynamic complaints fetch error:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Initial and trigger-based load
  useEffect(() => {
    loadComplaints(false);
  }, [statusFilter, searchPhone, currentUser]);

  useEffect(() => {
    if (initialSearchId) {
      setSearchQuery(initialSearchId);
      loadComplaints(false);
    }
  }, [initialSearchId]);

  // Dynamic Real-time Live Polling every 10 seconds
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      loadComplaints(true); // background silent fetch
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, statusFilter, searchPhone, searchQuery, currentUser]);

  // Compute live breakdown stats
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === "प्रलंबित").length;
  const inProgressCount = complaints.filter(c => c.status === "कार्य प्रगतीपथावर" || c.status === "तपासणी सुरू").length;
  const resolvedCount = complaints.filter(c => c.status === "निकाली काढली").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "निकाली काढली":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-400 font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>निकाली काढली (Done)</span>
          </span>
        );
      case "कार्य प्रगतीपथावर":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs px-2.5 py-1 rounded-full">
            <RotateCw className="w-3 h-3 text-amber-700 animate-spin" />
            <span>कार्य प्रगतीपथावर (In Progress)</span>
          </span>
        );
      case "तपासणी सुरू":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-300 font-bold text-xs px-2.5 py-1 rounded-full">
            <FileSearch className="w-3 h-3 text-blue-600" />
            <span>तपासणी सुरू (Under Review)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>प्रलंबित (Pending)</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 pb-20">
      {/* Top Bar with Dynamic Status Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span>माझ्या तक्रारी व सद्यस्थिती (Dynamic Status Tracker)</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>थेट लाईव्ह डेटा</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            आपण दाखल केलेल्या तक्रारींची थेट सद्यस्थिती. दादांच्या कार्यालयाने घेतलेली कृती आणि 'निकाली काढली (Done)' अहवाल येथे आपोआप अद्ययावत होतो.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-400 hidden sm:block text-right">
            अंतिम अपडेट: <strong>{lastRefreshed.toLocaleTimeString()}</strong>
          </div>
          <button
            onClick={() => loadComplaints(false)}
            disabled={loading}
            className="btn-press bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>डेटा रिफ्रेश</span>
          </button>
        </div>
      </div>

      {/* Desktop Widescreen Layout: Sidebar on Left + Expansive Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Filter Sidebar & Dynamic KPI Summary (Widescreen Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Dynamic KPI Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-600" />
              <span>तक्रारींची सद्यस्थिती आकडेवारी:</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block">एकूण तक्रारी</span>
                <span className="text-xl font-black text-slate-900">{totalCount}</span>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-center">
                <span className="text-[11px] text-amber-800 block">प्रलंबित</span>
                <span className="text-xl font-black text-amber-700">{pendingCount}</span>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 text-center">
                <span className="text-[11px] text-blue-800 block">काम सुरू</span>
                <span className="text-xl font-black text-blue-700">{inProgressCount}</span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-800 block">निकाली (Done)</span>
                <span className="text-xl font-black text-emerald-700">{resolvedCount}</span>
              </div>
            </div>
          </div>

          {/* Search Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                मोबाईल क्रमांकाने शोधा
              </label>
              <input
                type="tel"
                placeholder="उदा. ९८२२००००००"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                तक्रार क्रमांक (Token ID) किंवा विषय
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="उदा. AD-2026..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadComplaints(false)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                स्थितीनुसार फिल्टर करा
              </label>
              <div className="space-y-1">
                {["सर्व", "प्रलंबित", "तपासणी सुरू", "कार्य प्रगतीपथावर", "निकाली काढली"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      statusFilter === st
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{st}</span>
                    {st === "निकाली काढली" && <CheckCheck className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Widescreen Complaints Feed */}
        <div className="lg:col-span-8 xl:col-span-9">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center text-slate-500 shadow-xs">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-semibold">तक्रारींचा लाईव्ह डेटा तपासत आहे...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">
                कोणतीही तक्रार नोंद आढळली नाही
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                आपण प्रविष्ट केलेला मोबाईल क्रमांक तपासा किंवा पहिल्या टॅबवरून नवीन तक्रार दाखल करा.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {complaints.map((item) => {
                const isResolved = item.status === "निकाली काढली";
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                      isResolved
                        ? "border-emerald-300 bg-emerald-50/15"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                          #{item.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.priority === "अतितातडीची" 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : item.priority === "तातडीची" 
                              ? "bg-amber-50 text-amber-800 border border-amber-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div>{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Complaint Title */}
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Metadata & Location */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>{item.ward_village} ({item.address})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>दाखल तारीख: {item.created_at}</span>
                      </span>
                    </div>

                    {/* Citizen's description */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                      "{item.description}"
                    </p>

                    {/* Official Action Remarks (कार्यालयीन शेरा) */}
                    {item.admin_remarks && (
                      <div className={`p-3.5 rounded-xl border mb-3 ${
                        isResolved 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                          : "bg-amber-50 border-amber-200 text-amber-950"
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1">
                          {isResolved ? (
                            <>
                              <CheckCheck className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-800">मा. दादांच्या कार्यालयाचा अधिकृत अहवाल (Action Taken Report):</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span className="text-amber-800">कार्यालयीन कृती शेरा:</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                          "{item.admin_remarks}"
                        </p>
                        {item.resolved_at && (
                          <div className="text-[11px] text-emerald-700 font-medium mt-1">
                            निकाली काढल्याची तारीख: {item.resolved_at}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>कार्यालयास सूचना प्रेषित</span>
                      </div>

                      <button
                        onClick={() => setSelectedComplaint(item)}
                        className="btn-press text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"
                      >
                        <span>सविस्तर तपशील व फोटो पहा</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  #{selectedComplaint.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  तक्रार तपशील
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-500 font-medium">सद्यस्थिती:</span>
                <div>{getStatusBadge(selectedComplaint.status)}</div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">विषय:</span>
                <strong className="text-slate-900 text-sm sm:text-base">{selectedComplaint.title}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-500 block">प्रवर्ग:</span>
                  <strong className="text-slate-800">{selectedComplaint.category}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">प्राधान्य:</span>
                  <strong className="text-slate-800">{selectedComplaint.priority}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">गाव / प्रभाग:</span>
                  <strong className="text-slate-800">{selectedComplaint.ward_village}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">नोंदणी तारीख:</span>
                  <strong className="text-slate-800">{selectedComplaint.created_at}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">अचूक पत्ता:</span>
                <div className="text-slate-800 bg-slate-50 p-2 rounded-lg">{selectedComplaint.address}</div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">नागरिकाचे म्हणणे:</span>
                <p className="bg-slate-50 p-3 rounded-xl text-slate-800 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.photo_url && (
                <div>
                  <span className="text-slate-500 block mb-1 font-medium">संलग्न छायाचित्र:</span>
                  <img
                    src={selectedComplaint.photo_url}
                    alt="Complaint attachment"
                    className="w-full max-h-60 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {selectedComplaint.admin_remarks && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="text-xs font-bold text-emerald-900 mb-0.5">
                    कार्यालयाचा अधिकृत अहवाल:
                  </div>
                  <p className="text-emerald-900 font-semibold text-xs sm:text-sm">
                    {selectedComplaint.admin_remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="btn-press bg-slate-800 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl w-full"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
