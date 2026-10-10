import React, { useState } from "react";
import { loginApi, registerApi } from "../api";
import { User, Shield, Lock, Phone, X, AlertCircle } from "lucide-react";

export default function AuthModal({ initialMode = "client", onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'client', 'register', 'admin'
  const [formData, setFormData] = useState({
    username_or_mobile: "",
    password: "",
    full_name: "",
    mobile: "",
    ward_village: "प्रभाग क्र. ४ - विटा शहर",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const uname = mode === "admin" 
        ? (formData.username_or_mobile.trim() || "admin") 
        : formData.username_or_mobile.trim();
      const pwd = formData.password.trim();

      const res = await loginApi({
        username_or_mobile: uname,
        password: pwd
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "लॉगिन अयशस्वी झाले.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.full_name.trim()) {
      setErrorMsg("कृपया आपले नाव प्रविष्ट करा.");
      return;
    }
    if (formData.mobile.trim().length < 10) {
      setErrorMsg("कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg("पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi({
        full_name: formData.full_name,
        mobile: formData.mobile,
        ward_village: formData.ward_village,
        password: formData.password,
        email: formData.email
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "नोंदणी करताना अडचण आली.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-scaleUp relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => { setMode("client"); setErrorMsg(""); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "client" ? "bg-white text-orange-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            नागरिक लॉगिन
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(""); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "register" ? "bg-white text-orange-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            नवीन नोंदणी
          </button>
          <button
            type="button"
            onClick={() => { 
              setMode("admin"); 
              setErrorMsg(""); 
              setFormData((prev) => ({ ...prev, username_or_mobile: prev.username_or_mobile || "admin" }));
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "admin" ? "bg-slate-900 text-amber-400 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            प्रशासक
          </button>
        </div>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-orange-50 text-orange-600 border border-orange-200">
            {mode === "admin" ? <Shield className="w-5 h-5 text-amber-600" /> : <User className="w-5 h-5" />}
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {mode === "client" && "नागरिक प्रवेश (Citizen Login)"}
            {mode === "register" && "नवीन नागरिक नोंदणी (Sign Up)"}
            {mode === "admin" && "प्रशासकीय कक्ष लॉगिन (Admin)"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            आपला दादा तक्रार निवारण पोर्टल • विटा-खानापूर
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === "register" ? (
          /* Citizen Registration Form */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">पूर्ण नाव</label>
              <input
                type="text"
                required
                placeholder="उदा. रमेश तुकाराम पाटील"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">मोबाईल क्र. (हाच युझर आयडी असेल)</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="९८२२००००००"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">गाव / प्रभाग / परिसर</label>
              <input
                type="text"
                required
                placeholder="उदा. प्रभाग क्र. ४, विटा शहर"
                value={formData.ward_village}
                onChange={(e) => setFormData({ ...formData, ward_village: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">गुप्त पासवर्ड</label>
              <input
                type="password"
                required
                placeholder="किमान ६ अक्षरे"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs mt-2"
            >
              {loading ? "नोंदणी करत आहे..." : "नोंदणी पूर्ण करा (Register)"}
            </button>
          </form>
        ) : (
          /* Login Form (Client or Admin) */
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {mode === "admin" ? "प्रशासक युझरनेम (Username)" : "नोंदणीकृत मोबाईल क्र. किंवा नाव"}
              </label>
              <input
                type="text"
                required
                placeholder={mode === "admin" ? "admin" : "मोबाईल क्र. (उदा. ९८६०११७६६९) किंवा नाव"}
                value={formData.username_or_mobile}
                onChange={(e) => setFormData({ ...formData, username_or_mobile: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                पासवर्ड
              </label>
              <input
                type="password"
                required
                placeholder="••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-press w-full font-bold py-2.5 rounded-xl text-xs shadow-xs mt-2 ${
                mode === "admin" 
                  ? "bg-slate-900 hover:bg-slate-800 text-amber-400" 
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {loading ? "प्रवेश करत आहे..." : "प्रवेश करा (Login)"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
