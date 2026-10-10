import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

import uvicorn

if __name__ == "__main__":
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)

    # Render supplies PORT via environment variable
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("=" * 60)
    print("आपला दादा - नागरी तक्रार निवारण कक्ष (विटा-खानापूर)")
    print("लोकनेते मा. श्री. वैभव (दादा) पाटील जनसंपर्क कार्यालय")
    print("=" * 60)
    print(f"सर्व्हर सुरू होत आहे: http://{host}:{port}")
    print("=" * 60)
    
    uvicorn.run("main:app", host=host, port=port, reload=False, app_dir=backend_dir)
