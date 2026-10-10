import React, { useState } from "react";
import { 
  Award, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  X, 
  Layers,
  GraduationCap,
  TreePine,
  Building2,
  Sparkles
} from "lucide-react";

export default function DadaWorks() {
  const [selectedWork, setSelectedWork] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const works = [
    {
      id: 1,
      title: "स्वच्छ व सुंदर विटा-खानापूर अभियान आणि नागरी पाहणी दौरा",
      category: "नागरी सुविधा व स्वच्छता",
      filterTag: "civic",
      image: "/assets/media_1791609658536.jpg",
      date: "ऑक्टोबर २०२५",
      location: "विटा शहर मुख्य रस्ते व प्रभाग परिसर",
      observation: "विटा-खानापूर शहरातील रस्ते, चौक आणि नागरी वस्त्यांची प्रत्यक्ष जागेवर जाऊन पाहणी करताना मा. लोकनेते वैभव (दादा) पाटील. रस्त्यांची स्वच्छता, कचरा व्यवस्थापन आणि नागरिकांना भेडसावणाऱ्या समस्या स्वतः पायी फिरून जाणून घेतल्या. स्थानिक नागरिक आणि स्वच्छता कर्मचाऱ्यांशी थेट संवाद साधून त्यांच्या पाठीशी खंबीरपणे उभे राहण्याची ग्वाही दिली. संबंधित प्रशासनास तातडीने कामाला लागण्याचे निर्देश दिले.",
      impact: "५०+ किलोमीटर परिसर स्वच्छता व नागरी सुविधा पाहणी",
      highlights: [
        "प्रभागातील नागरी सुविधांची प्रत्यक्ष जागेवर जाऊन पाहणी",
        "स्थानिक नागरिकांशी थेट संवाद व तक्रारींचे जागीच निवारण",
        "स्वच्छता कर्मचाऱ्यांना आवश्यक साधने आणि पाठबळ",
        "कचराकुंडी मुक्त परिसर व नियमित घंटागाडीची सोय"
      ]
    },
    {
      id: 2,
      title: "युवा सक्षमीकरण व राष्ट्रीय सेवा योजना (NSS) संवाद शिबीर",
      category: "युवक सक्षमीकरण व शिक्षण",
      filterTag: "youth",
      image: "/assets/media_1791609658546.jpg",
      date: "डिसेंबर २०२५",
      location: "आदर्श इन्स्टिट्यूट ऑफ टेक्नॉलॉजी अँड रिसर्च सेंटर (AITRC), विटा",
      observation: "विटा येथील आदर्श इन्स्टिट्यूट ऑफ टेक्नॉलॉजी अँड रिसर्च सेंटर (AITRC) मधील 'राष्ट्रीय सेवा योजना' (NSS) शिबिरामध्ये शेकडो तरुण-तरुणींशी संवाद साधताना मा. वैभव दादा. 'श्रमदान, तंत्रज्ञान आणि युवकांची ऊर्जा यातूनच विटा-खानापूरचा विकास साधता येईल' हा विचार त्यांनी मांडला. तरुणांना केवळ पदवीपुरते मर्यादित न राहता राष्ट्रनिर्माणात आणि समाजसेवेत पुढाकार घेण्याचे आवाहन दादांनी केले.",
      impact: "१,२००+ महाविद्यालयीन विद्यार्थ्यांशी थेट संवाद व मार्गदर्शन",
      highlights: [
        "विटा परिसरातील उच्च व तंत्रशिक्षणाचा दर्जा उंचावण्यास प्राधान्य",
        "राष्ट्रीय सेवा योजना (NSS) उपक्रमांना आर्थिक व सामाजिक बळ",
        "ग्रामीण भागातील विद्यार्थ्यांसाठी स्पर्धा परीक्षा व करिअर मार्गदर्शन",
        "'Not Me But You' या ब्रीदानुसार समाजसेवेची शपथ"
      ]
    },
    {
      id: 3,
      title: "भव्य विद्यार्थी श्रमदान, वृक्षारोपण व पर्यावरण संवर्धन अभियान",
      category: "पर्यावरण व श्रमदान",
      filterTag: "environment",
      image: "/assets/media_1791609658578.jpg",
      date: "जानेवारी २०२६",
      location: "विटा ग्रामीण परिसर व महाविद्यालय संकुल",
      observation: "विटा परिसरामध्ये शेकडो विद्यार्थी आणि स्वयंसेवकांच्या उत्स्फूर्त सहभागाने आयोजित भव्य श्रमदान आणि पर्यावरण संवर्धन अभियानात सहभागी झालेले मा. वैभव दादा. स्वतः स्वच्छता आणि वृक्षारोपण करून पर्यावरणाचा समतोल राखण्याचा संदेश दिला. दादांच्या एका आवाहनाला प्रतिसाद देत संपूर्ण परिसरातील युवकांनी विटा परिसर स्वच्छ, सुंदर आणि हरित बनवण्याचा दृढ संकल्प केला.",
      impact: "५००+ वृक्षारोपण आणि संपूर्ण परिसराचे श्रमदानातून सुशोभीकरण",
      highlights: [
        "शेकडो महाविद्यालयीन तरुणांचा प्रत्यक्ष मोहिमेमध्ये सक्रिय सहभाग",
        "स्वच्छता स्वयंसेवकांचा दादांच्या हस्ते जाहीर गौरव व सत्कार",
        "ग्रामीण आणि शहराच्या सीमाभागात हरित पट्टा निर्मिती",
        "पाणी टंचाईवर मात करण्यासाठी वृक्ष संवर्धनाचा संकल्प"
      ]
    },
    {
      id: 4,
      title: "राष्ट्रीय पातळीवर ऐतिहासिक गौरव - मा. राष्ट्रपती महोदयांच्या हस्ते विशेष सन्मान",
      category: "राष्ट्रीय गौरव व सन्मान",
      filterTag: "award",
      image: "/assets/media_1791609675057.jpg",
      date: "विशेष राष्ट्रीय पुरस्कार सोहळा",
      location: "नवी दिल्ली (राष्ट्रीय सोहळा)",
      observation: "विटा-खानापूरच्या विकासातील अलौकिक कार्य आणि अविरत लोकसेवेची देशाच्या सर्वोच्च स्तरावर झालेली गौरवशाली नोंद! भारताचे तत्कालीन महामहीम राष्ट्रपती मा. रामनाथ कोविंद यांच्या शुभहस्ते नवी दिल्ली येथे विशेष राष्ट्रीय पुरस्कार व सन्मानपत्र स्वीकारताना मा. वैभव (दादा) पाटील आणि सन्माननीय सहकारी. दादांच्या लोककल्याणकारी नेतृत्वामुळे विटा-खानापूर मतदारसंघाचे नाव संपूर्ण देशात अभिमानाने उंचावले.",
      impact: "विटा-खानापूर मतदारसंघाच्या जनसेवेला मिळालेली सर्वोच्च राष्ट्रीय मान्यता",
      highlights: [
        "ग्रामीण विकास, समाजसेवा आणि उत्कृष्ट नागरी नेतृत्वाची राष्ट्रीय पावती",
        "महामहीम राष्ट्रपती महोदयांकडून पाठीवर शाबासकीची थाप",
        "विटा-खानापूरच्या जनतेच्या विश्वासाला मिळालेला सर्वोच्च बहुमान",
        "विकासाची अखंड परंपरा पुढे नेण्याचा दृढ संकल्प"
      ]
    }
  ];

  const filteredWorks = activeFilter === "all" 
    ? works 
    : works.filter(w => w.filterTag === activeFilter);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 py-5 pb-20">
      {/* Full Widescreen Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-6 relative overflow-hidden border border-slate-700">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img 
              src="/assets/media_1791609554510.png" 
              alt="मा. वैभव दादा पाटील" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-orange-500 shadow-md object-cover bg-white"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-1.5 border border-orange-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>लोकनेते • विटा-खानापूर विधानसभा मतदारसंघ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                मा. श्री. वैभव (दादा) पाटील
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                विकासकामे, सामाजिक योगदान व मतदारसंघातील महत्त्वपूर्ण टप्पे
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center border border-white/10 min-w-[110px]">
              <span className="block text-xl sm:text-2xl font-black text-orange-400">१५०+</span>
              <span className="text-[11px] text-slate-300 font-medium">किमी रस्ते विकास</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center border border-white/10 min-w-[110px]">
              <span className="block text-xl sm:text-2xl font-black text-orange-400">४५+</span>
              <span className="text-[11px] text-slate-300 font-medium">गावे पाणीपुरवठा</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 sm:p-4 text-center border border-white/10 min-w-[110px]">
              <span className="block text-xl sm:text-2xl font-black text-orange-400">१००%</span>
              <span className="text-[11px] text-slate-300 font-medium">जनतेशी कटिबद्ध</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === "all"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>सर्व विकासकामे ({works.length})</span>
        </button>
        <button
          onClick={() => setActiveFilter("civic")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === "civic"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>स्वच्छता व नागरी पाहणी</span>
        </button>
        <button
          onClick={() => setActiveFilter("youth")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === "youth"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>युवा संवाद व NSS शिबीर</span>
        </button>
        <button
          onClick={() => setActiveFilter("environment")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === "environment"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <TreePine className="w-3.5 h-3.5" />
          <span>श्रमदान व पर्यावरण संवर्धन</span>
        </button>
        <button
          onClick={() => setActiveFilter("award")}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === "award"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>राष्ट्रीय राष्ट्रपती सन्मान</span>
        </button>
      </div>

      {/* Full Widescreen 4-Column Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {filteredWorks.map((work) => (
          <div 
            key={work.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/11] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedWork(work)}>
              <img 
                src={work.image} 
                alt={work.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                <span className="bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  {work.category}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-2 text-[10px] text-orange-200 font-medium mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{work.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3" />
                    <span>{work.location}</span>
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold leading-snug drop-shadow-xs line-clamp-2">
                  {work.title}
                </h3>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedWork(work); }}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                title="सविस्तर पहा"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content & Observations */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                  मराठीतील विशेष निरीक्षण:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-4">
                  {work.observation}
                </p>
              </div>

              {/* Highlights */}
              <div>
                <div className="text-[11px] font-bold text-slate-800 mb-1">
                  प्रमुख वैशिष्ट्ये:
                </div>
                <ul className="space-y-1">
                  {work.highlights.slice(0, 3).map((hl, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-medium">
                  {work.impact}
                </span>
                <button
                  onClick={() => setSelectedWork(work)}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>सविस्तर</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-300 max-h-[92vh] flex flex-col">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black">
              <img 
                src={selectedWork.image} 
                alt={selectedWork.title} 
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedWork.category}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedWork.date}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedWork.location}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {selectedWork.title}
                </h3>
              </div>

              <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wide mb-1">
                  मा. दादांचे योगदान व प्रत्यक्ष निरीक्षण:
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {selectedWork.observation}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  महत्त्वाचे पैलू:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedWork.highlights.map((hl, i) => (
                    <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setSelectedWork(null)}
                  className="btn-press bg-slate-900 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
