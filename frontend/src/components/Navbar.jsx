import React from "react";
import { Phone, Shield, User, LogOut, FileText, Award, Clock, Mail } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top official information bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 sm:px-8 font-medium">
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span className="font-semibold tracking-wide">लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय • विटा-खानापूर</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3 h-3 text-orange-400" />
              <span>कार्यालय संपर्क: ०२३४७ २७००००</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3 h-3 text-orange-400" />
              <span>sagareparth@gmail.com</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main App Bar - Full Widescreen */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
        {/* Logo and Title */}
        <div 
          onClick={() => setActiveTab("form")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img 
            src="/assets/media_1791609554510.png" 
            alt="मा. वैभव दादा पाटील" 
            className="w-11 h-11 rounded-full object-cover border border-orange-500 shadow-xs group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                आपला दादा
              </h1>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200">
                तक्रार निवारण कक्ष
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
              विटा-खानापूर विधानसभा मतदारसंघ • जनसेवेचे अधिकृत व्यासपीठ
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-white text-orange-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>नवीन तक्रार नोंदणी</span>
          </button>

          <button
            onClick={() => setActiveTab("works")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "works"
                ? "bg-white text-orange-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-orange-600" />
            <span>दादांची विकासकामे</span>
          </button>

          <button
            onClick={() => setActiveTab("my-complaints")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "my-complaints"
                ? "bg-white text-orange-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>माझ्या तक्रारी</span>
          </button>

          {currentUser?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>प्रशासकीय कक्ष</span>
            </button>
          )}
        </nav>

        {/* User / Login controls */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-3 pr-2 py-1 rounded-full">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.role === "admin" ? "प्रशासक" : "नागरिक"}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="लॉगआउट"
                className="w-7 h-7 rounded-full bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center border border-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth("client")}
                className="btn-press bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>नागरिक प्रवेश</span>
              </button>
              <button
                onClick={() => onOpenAuth("admin")}
                className="btn-press bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1"
                title="प्रशासक लॉगिन"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">प्रशासक</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
