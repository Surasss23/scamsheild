# ScamShield

A free, public, multilingual cyber-safety awareness platform.

## Principles
- No visitor login, registration, subscriptions or database.
- English by default, with Hindi and Telugu interface/audio support.
- Local, transparent analysis for URLs, messages, email text, job offers, UPI-related messages, phone-number patterns and screenshots.
- QR decoding and screenshot OCR run in the visitor's browser.
- No scan content is stored or sent to a database.
- Risk scores are heuristic indicators, not proof or a guarantee of safety.

## Stack
Next.js, TypeScript, Tailwind CSS, browser Web Speech API, Tesseract.js (on-device OCR) and jsQR (QR decoding). Deployed on Vercel from GitHub.

## Development
Vercel installs dependencies and builds the project from this repository. No local installation is required for the repository owner.

## Safety and limitations
- URL checks use local structural heuristics; they do not establish live domain reputation or malware status.
- Phone-number checks cannot confirm the identity or reputation of a caller.
- QR codes are decoded locally; users must inspect the destination before opening it.
- Screenshot OCR runs in the browser and may make mistakes.
- A low risk score never means a message or website is safe.
- The site does not submit complaints on a visitor's behalf. It provides official reporting guidance and links.

## Official India reporting
- Cybercrime portal: https://cybercrime.gov.in/
- Financial cyber fraud helpline: 1930
