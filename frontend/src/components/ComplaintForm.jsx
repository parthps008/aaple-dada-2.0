import React, { useState, useEffect } from "react";
import { submitComplaintApi } from "../api";
import { 
  Send, 
  Upload, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Route,
  Droplets,
  Building2,
  Zap,
  FileCheck2,
  Trash2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  FileText
} from "lucide-react";

const CATEGORIES = [
  { id: "रस्ते दुरुस्ती व खड्डे", label: "रस्ते दुरुस्ती व खड्डे", Icon: Route, iconColor: "text-orange-600 bg-orange-50", desc: "रस्त्यांवरील खड्डे, डांबरीकरण, गतिरोधक" },
  { id: "पाणी पुरवठा व गळती", label: "पाणी पुरवठा व गळती", Icon: Droplets, iconColor: "text-sky-600 bg-sky-50", desc: "पिण्याचे पाणी, पाईपलाईन गळती, टंचाई" },
  { id: "नगरपालिका/ग्रामपंचायत", label: "नगरपालिका / ग्रामपंचायत", Icon: Building2, iconColor: "text-slate-700 bg-slate-100", desc: "नागरी सुविधा, दाखले, ड्रेनेज, विकासकामे" },
  { id: "वीज पुरवठा व पथदिवे", label: "वीज पुरवठा व पथदिवे", Icon: Zap, iconColor: "text-amber-600 bg-amber-50", desc: "पथदिवे बंद, ट्रान्सफॉर्मर, वीज खंडित" },
  { id: "शासकीय योजना", label: "शासकीय योजना लाभ", Icon: FileCheck2, iconColor: "text-indigo-600 bg-indigo-50", desc: "लाडकी बहीण, शेतकरी सन्मान, घरकुल, इ." },
  { id: "कचरा व स्वच्छता", label: "कचरा व स्वच्छता", Icon: Trash2, iconColor: "text-emerald-600 bg-emerald-50", desc: "कचराकुंडी सफाई, नियमित घंटागाडी" },
  { id: "इतर सार्वजनिक समस्या", label: "इतर सार्वजनिक समस्या", Icon: HelpCircle, iconColor: "text-purple-600 bg-purple-50", desc: "इतर कोणत्याही स्थानिक अडचणी" },
];

const WARDS = [
  "प्रभाग क्र. १ - विटा शहर (शिवाजी चौक / बाजारपेठ)",
  "प्रभाग क्र. २ - विटा शहर (बस स्टँड परिसर / नेहरूनगर)",
  "प्रभाग क्र. ३ - विटा शहर (सोनार गल्ली / जुना विटा)",
  "प्रभाग क्र. ४ - विटा शहर (शांतीनगर / कॉलेज परिसर)",
  "प्रभाग क्र. ५ - विटा शहर (आदर्श नगर / उद्योग वसाहत)",
  "खानापूर शहर व परिसर",
  "भाळवणी गाव परिसर",
  "भिवघाट परिसर",
  "लेंगरे गाव परिसर",
  "करंजे परिसर",
  "बांबवडे गाव परिसर",
  "घोगाव परिसर",
  "तांबवे परिसर",
  "इतर ग्रामीण भाग (विटा-खानापूर)"
];

export default function ComplaintForm({ currentUser, onComplaintCreated, onNavigateToTrack }) {
  const [formData, setFormData] = useState({
    citizen_name: "",
    citizen_phone: "",
    citizen_email: "",
    category: "रस्ते दुरुस्ती व खड्डे",
    ward_village: WARDS[0],
    address: "",
    title: "",
    description: "",
    priority: "सर्वसाधारण",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        citizen_name: currentUser.full_name || prev.citizen_name,
        citizen_phone: currentUser.mobile || prev.citizen_phone,
        citizen_email: currentUser.email || prev.citizen_email,
        ward_village: currentUser.ward_village || prev.ward_village,
      }));
    }
  }, [currentUser]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.citizen_name.trim()) {
      setErrorMsg("कृपया आपले नाव प्रविष्ट करा.");
      return;
    }
    if (!formData.citizen_phone.trim() || formData.citizen_phone.length < 10) {
      setErrorMsg("कृपया वैध १० अंकी संपर्क मोबाईल क्रमांक प्रविष्ट करा.");
      return;
    }
    if (!formData.title.trim()) {
      setErrorMsg("कृपया तक्रारीचा विषय प्रविष्ट करा.");
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg("कृपया समस्येचे सविस्तर वर्णन प्रविष्ट करा.");
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("citizen_name", formData.citizen_name);
      formPayload.append("citizen_phone", formData.citizen_phone);
      formPayload.append("citizen_email", formData.citizen_email || "");
      formPayload.append("category", formData.category);
      formPayload.append("ward_village", formData.ward_village);
      formPayload.append("address", formData.address || formData.ward_village);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("priority", formData.priority);
      if (currentUser?.id) {
        formPayload.append("user_id", String(currentUser.id));
      }
      if (photoFile) {
        formPayload.append("photo", photoFile);
      }

      const res = await submitComplaintApi(formPayload);
      setSuccessData(res);
      if (onComplaintCreated) onComplaintCreated(res.complaint);
    } catch (err) {
      setErrorMsg(err.message || "तक्रार नोंदवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setFormData({
      citizen_name: currentUser?.full_name || "",
      citizen_phone: currentUser?.mobile || "",
      citizen_email: currentUser?.email || "",
      category: "रस्ते दुरुस्ती व खड्डे",
      ward_village: WARDS[0],
      address: "",
      title: "",
      description: "",
      priority: "सर्वसाधारण",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 pb-20">
      {/* Success Dialog */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              तक्रार यशस्वीरित्या नोंदवली गेली आहे
            </h3>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 my-4">
              <span className="text-[11px] text-orange-800 font-bold uppercase tracking-wider block">
                तक्रार क्रमांक (Complaint Token ID)
              </span>
              <span className="text-2xl font-mono font-black text-orange-700 tracking-wide">
                {successData.complaint_id}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              आपल्या तक्रारीची अधिकृत सूचना मा. वैभव दादांच्या जनसंपर्क कार्यालयास (sagareparth@gmail.com) पाठवली गेली आहे. काम पूर्ण होताच आपल्या डॅशबोर्डवर <strong>'निकाली काढली (Done)'</strong> असा शेरा दिसेल.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  onNavigateToTrack(successData.complaint_id);
                  setSuccessData(null);
                }}
                className="btn-press flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <span>माझ्या तक्रारी तपासा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetForm}
                className="btn-press flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm"
              >
                नवीन तक्रार करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leadership, Constituency Overview & Citizen Charter (Widescreen Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          {/* Leader Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/assets/media_1791609554510.png" 
                alt="मा. वैभव दादा पाटील" 
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 shadow-sm"
              />
              <div>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                  लोकनेते • विटा-खानापूर
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  मा. श्री. वैभव (दादा) पाटील
                </h3>
                <p className="text-xs text-slate-500">
                  जनसंपर्क कार्यालय, शिवाजी चौक, विटा
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              "विटा-खानापूर मतदारसंघातील प्रत्येक नागरिकाच्या अडचणी सोडवणे, मूलभूत नागरी सुविधा उपलब्ध करून देणे आणि पारदर्शक कारभार हेच आमचे ध्येय आहे."
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-orange-50/70 p-2 rounded-xl">
                <span className="block font-black text-orange-700 text-sm">२४ तास</span>
                <span className="text-[11px] text-slate-500">जनसंपर्क तत्परता</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="block font-black text-slate-800 text-sm">१००%</span>
                <span className="text-[11px] text-slate-500">पारदर्शक निवारण</span>
              </div>
            </div>
          </div>

          {/* Citizen Charter & Guarantees */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>नागरी तक्रार निवारण हमी:</span>
            </h4>
            
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">१</span>
                <span><strong>तात्काळ अधिकृत ईमेल सूचना:</strong> तक्रार दाखल होताच दादांच्या जनसंपर्क कार्यालयास त्वरित ईमेल प्रेषित होतो.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">२</span>
                <span><strong>स्थानिक प्रशासनाशी समन्वय:</strong> नगरपालिका, महावितरण किंवा पाणीपुरवठा विभागास प्रत्यक्ष जागेवर पाहणीचे आदेश.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">३</span>
                <span><strong>'निकाली काढली (Done)' शेरा:</strong> काम पूर्ण झाल्यावर कार्यालयाचा अधिकृत अहवाल आपल्या डॅशबोर्डवर थेट दिसतो.</span>
              </li>
            </ul>
          </div>

          {/* Quick Helpline Card */}
          <div className="bg-gradient-to-br from-slate-900 to-stone-900 text-white rounded-2xl p-4 shadow-xs border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">थेट कार्यालयीन संपर्क कक्ष</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              कोणतीही तातडीची नागरी समस्या असल्यास थेट संपर्क साधा:
            </p>
            <div className="font-mono text-sm font-bold text-white bg-white/10 p-2 rounded-xl text-center border border-white/10">
              ०२३४७ २७०००० / +९१ ९८२२० ०००००
            </div>
          </div>
        </div>

        {/* Right Column: Full Widescreen Complaint Submission Form */}
        <div className="lg:col-span-8 xl:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-7 space-y-5">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-700 mb-1">
                <FileText className="w-4 h-4" />
                <span>नागरी अर्ज</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                नागरी समस्या व तक्रार नोंदणी अर्ज
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                खालील अर्जामध्ये आपल्या समस्येचा अचूक तपशील प्रविष्ट करा.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Category Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
                १. तक्रारीचा प्रवर्ग निवडा <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  const IconComponent = cat.Icon;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`btn-press p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-500"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${cat.iconColor} border border-black/5`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${isSelected ? "text-orange-900" : "text-slate-800"}`}>
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Priority Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                २. तक्रारीचे प्राधान्य
              </label>
              <div className="grid grid-cols-3 gap-2.5 max-w-md">
                {[
                  { id: "सर्वसाधारण", label: "सर्वसाधारण", dot: "bg-blue-500", border: "border-blue-300 bg-blue-50/60 text-blue-900" },
                  { id: "तातडीची", label: "तातडीची", dot: "bg-amber-500", border: "border-amber-300 bg-amber-50/60 text-amber-900" },
                  { id: "अतितातडीची", label: "अतितातडीची", dot: "bg-red-500", border: "border-red-300 bg-red-50/60 text-red-900" },
                ].map((p) => {
                  const isSelected = formData.priority === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setFormData({ ...formData, priority: p.id })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? `${p.border} ring-1 ring-orange-500 shadow-xs` 
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.dot}`}></span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Citizen Details Grid */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-600" />
                <span>३. तक्रारदाराचा संपर्क तपशील</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    पूर्ण नाव <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. रमेश तुकाराम पाटील"
                    value={formData.citizen_name}
                    onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    मोबाईल क्रमांक <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">+९१</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="९८२२००००००"
                      value={formData.citizen_phone}
                      onChange={(e) => setFormData({ ...formData, citizen_phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ईमेल पत्ता (ऐच्छिक)
                  </label>
                  <input
                    type="email"
                    placeholder="उदा. citizen@example.com"
                    value={formData.citizen_email}
                    onChange={(e) => setFormData({ ...formData, citizen_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    गाव / प्रभाग / परिसर <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ward_village}
                    onChange={(e) => setFormData({ ...formData, ward_village: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none bg-white font-medium"
                  >
                    {WARDS.map((w, idx) => (
                      <option key={idx} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Issue Description */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>४. समस्येचे अचूक ठिकाण व कैफियत</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  अचूक ठिकाण / लँडमार्क / गल्लीचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सोनार गल्ली, जुना विटा, मारुती मंदिराशेजारी"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  तक्रारीचा विषय / शीर्षक <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मुख्य रस्त्यावरील खड्डे बुजवून डांबरीकरण करणेबाबत"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  समस्येचे सविस्तर वर्णन <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="आपल्याला भेडसावणाऱ्या समस्येचे संपूर्ण वर्णन येथे मराठीत लिहा..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-orange-500 outline-none resize-y"
                ></textarea>
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  समस्येचे छायाचित्र (Photo Attachment - ऐच्छिक)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-orange-400 transition-colors bg-slate-50/50">
                  {photoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={photoPreview} alt="Preview" className="h-28 object-cover rounded-lg border shadow-xs" />
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        छायाचित्र काढून टाका
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-orange-600 hover:underline">
                          येथे क्लिक करून फोटो निवडा
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          PNG, JPG किंवा JPEG फॉरमॅट
                        </span>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-press w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>तक्रार नोंदवत आहे व ईमेल सूचना पाठवत आहे...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>तक्रार सादर करा (Submit Complaint)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                तक्रार सादर होताच मा. वैभव दादांच्या कार्यालयास (sagareparth@gmail.com) अधिकृत ईमेल पाठवला जातो.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
