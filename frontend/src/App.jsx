import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ComplaintForm from "./components/ComplaintForm";
import DadaWorks from "./components/DadaWorks";
import MyComplaints from "./components/MyComplaints";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import EmailPreviewModal from "./components/EmailPreviewModal";
import { 
  FileText, 
  Award, 
  Clock, 
  Shield
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("form"); // 'form', 'works', 'my-complaints', 'admin'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("aapla_dada_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("client");
  const [emailPreviewData, setEmailPreviewData] = useState(null);
  const [highlightComplaintId, setHighlightComplaintId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("aapla_dada_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("aapla_dada_user");
    }
  }, [currentUser]);

  const handleOpenAuth = (mode = "client") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("form");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("form");
  };

  const handleComplaintCreated = (complaint) => {
    setHighlightComplaintId(complaint.id);
  };

  const handleNavigateToTrack = (complaintId) => {
    setHighlightComplaintId(complaintId);
    setActiveTab("my-complaints");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-marathi select-none touch-manipulation">
      {/* Top App Bar & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16 md:pb-6">
        {activeTab === "form" && (
          <ComplaintForm
            currentUser={currentUser}
            onComplaintCreated={handleComplaintCreated}
            onNavigateToTrack={handleNavigateToTrack}
          />
        )}

        {activeTab === "works" && (
          <DadaWorks />
        )}

        {activeTab === "my-complaints" && (
          <MyComplaints
            currentUser={currentUser}
            initialSearchId={highlightComplaintId}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboard
            onOpenEmailPreview={(comp) => setEmailPreviewData(comp)}
          />
        )}
      </main>

      {/* Mobile App Bottom Tab Bar (App-Level Interface & No Zoom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "form" ? "text-orange-600 font-bold" : "text-slate-500 font-medium"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">तक्रार नोंदवा</span>
        </button>

        <button
          onClick={() => setActiveTab("works")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "works" ? "text-orange-600 font-bold" : "text-slate-500 font-medium"
          }`}
        >
          <Award className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">विकासकामे</span>
        </button>

        <button
          onClick={() => setActiveTab("my-complaints")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === "my-complaints" ? "text-orange-600 font-bold" : "text-slate-500 font-medium"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">माझ्या तक्रारी</span>
        </button>

        {currentUser?.role === "admin" ? (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              activeTab === "admin" ? "text-amber-600 font-bold" : "text-slate-600 font-medium"
            }`}
          >
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] mt-0.5">प्रशासक</span>
          </button>
        ) : (
          <button
            onClick={() => handleOpenAuth("admin")}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 font-medium"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">कार्यालय कक्ष</span>
          </button>
        )}
      </nav>

      {/* Global Modals */}
      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {emailPreviewData && (
        <EmailPreviewModal
          data={emailPreviewData}
          onClose={() => setEmailPreviewData(null)}
        />
      )}
    </div>
  );
}
