import React from "react";
import { X, Mail } from "lucide-react";

export default function EmailPreviewModal({ data, onClose }) {
  if (!data) return null;

  let htmlContent = data.body_html;
  if (!htmlContent) {
    const priorityColor = data.priority === "अतितातडीची" ? "#dc2626" : (data.priority === "तातडीची" ? "#ea580c" : "#2563eb");
    htmlContent = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%); color: #ffffff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
            .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.95; }
            .badge-bar { display: flex; justify-content: space-between; align-items: center; background: #fff7ed; padding: 10px 20px; border-bottom: 1px solid #fed7aa; }
            .token { font-weight: 800; color: #c2410c; font-size: 14px; font-family: monospace; }
            .priority { background-color: ${priorityColor}; color: white; padding: 3px 12px; border-radius: 16px; font-size: 11px; font-weight: bold; }
            .content { padding: 20px; font-size: 13px; }
            .section-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 14px; margin-bottom: 8px; border-bottom: 2px solid #ea580c; padding-bottom: 2px; display: inline-block; text-transform: uppercase; }
            .desc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #ea580c; border-radius: 8px; padding: 12px 14px; margin: 12px 0; font-size: 13px; line-height: 1.5; color: #334155; }
            .footer { background: #f1f5f9; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>आपला दादा - नागरी तक्रार निवारण कक्ष</h1>
                <p>लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय, विटा-खानापूर</p>
            </div>
            <div class="badge-bar">
                <span class="token">तक्रार क्र.: #${data.id}</span>
                <span class="priority">प्राधान्य: ${data.priority || 'सर्वसाधारण'}</span>
            </div>
            <div class="content">
                <p style="color: #475569; margin-top: 0;">
                    मा. वैभव दादा पाटील यांच्या कार्यालयास कळविण्यात येते की, <strong>${data.citizen_name || 'नागरिक'}</strong> यांनी नवीन तक्रार नोंदवली आहे.
                </p>
                <div class="section-title">नागरिकाचा तपशील</div>
                <p>नाव: <strong>${data.citizen_name || '-'}</strong> | फोन: <strong>${data.citizen_phone || '-'}</strong> | परिसर: <strong>${data.ward_village || '-'}</strong></p>
                
                <div class="section-title">तक्रारीचा तपशील</div>
                <div style="font-size: 14px; font-weight: bold; color: #ea580c; margin-bottom: 4px;">प्रवर्ग: ${data.category || '-'} - ${data.title || '-'}</div>
                <div class="desc-box">${data.description || '-'}</div>
            </div>
            <div class="footer">
                लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय • विटा-खानापूर
            </div>
        </div>
    </body>
    </html>
    `;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                SMTP ईमेल टेम्पलेट पूर्वावलोकन
              </h3>
              <p className="text-[11px] text-slate-300">
                वैभव दादा पाटील जनसंपर्क कार्यालयास पाठवला जाणारा अधिकृत ईमेल
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info bar */}
        <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-600 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>प्राप्तकर्ता:</strong> office.vaibhavdada@gmail.com
          </div>
          <div>
            <strong>विषय:</strong> {data.title ? `[आपला दादा पोर्टल] नवीन तक्रार #${data.id}` : "अधिकृत ईमेल सूचना"}
          </div>
        </div>

        {/* Live Frame */}
        <div className="flex-1 p-3 bg-slate-100 overflow-hidden">
          <iframe
            title="Email Preview"
            srcDoc={htmlContent}
            className="w-full h-full min-h-[400px] rounded-xl border border-slate-200 bg-white"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            तक्रार नोंद होताच ही सूचना स्वयंचलित पाठवली जाते.
          </span>
          <button
            onClick={onClose}
            className="btn-press bg-slate-800 text-white font-bold text-xs py-1.5 px-4 rounded-xl hover:bg-slate-700"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
}
