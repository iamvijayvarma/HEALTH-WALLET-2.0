# Health Wallet 2.0

> **“Your Health. Always With You.”**  
> An institutional-grade, modern, trustworthy digital healthcare platform designed for citizens, families, and public-health emergencies.

---

## 🏥 Overview

**Health Wallet** is a production-ready frontend web application engineered to serve as a national citizen healthcare portal (aligned with standards like Ayushman Bharat ABDM, NHS, and Singapore HealthHub). It unifies electronic health records, diagnostic laboratory reports, emergency trauma triage passes, family health circles, and blood/organ donation coordination in a single, accessible platform.

---

## ✨ Key Features & Screens

1. **Public Health Landing Portal (`/landing`)**: Official public portal with ABDM compliance certifications, citizen value propositions, emergency preparedness focus, and national emergency helplines.
2. **Citizen Authentication (`/login` & `/signup`)**: Dual-mode login (Password & Fast OTP), Aadhaar/National ID verification modal simulation, and a 5-step onboarding wizard.
3. **Overview Dashboard (`/dashboard`)**: Citizen greeting, 4 quick stat cards (Blood Group, Active Allergies, Medicines, Family), high-priority Emergency Assistance banner, recent records, and health timeline.
4. **Health Records Repository (`/records`)**: Filterable repository (*Lab Reports*, *Prescriptions*, *Imaging*, *Consultations*), instant search, certified report preview modal, upload flow, and archive controls.
5. **AI Diagnostic Report Scanner (`/scan`)**: Camera viewfinder and document upload dropzone with multi-phase OCR extraction. Enforces the clinical protocol: **AI Extraction → User Review Table (Inline Editable) → Confirmation → Save to Wallet**.
6. **Active Medicines & Prescriptions (`/medicines`)**: Daily dosage schedule, interactive adherence streak tracker (`%`), low-stock warnings, and 1-click pharmacy refill requests.
7. **Family Health Circles (`/family`)**: Linked family profiles with proxy consent controls, 2-step OTP authorization flow, and individual vitals summary.
8. **Blood Donation & Matching (`/blood-donation`)**: Nearby verified donor directory with proximity radius, emergency blood requirement creator, and donor request notification system.
9. **National Organ Donation Registry (`/organ-donation`)**: Official voluntary intention pledge registry under the NOTTO framework standard with a downloadable Digital Organ Donor Card.
10. **Emergency Center (`/emergency`)**: High-priority trauma triage screen with auto-detected GPS coordinates, blood group, severe allergies, and interactive **ACTIVATE EMERGENCY** flow with cancelable countdown and live dispatch logs.
11. **Offline Health Wallet (`/offline`)**: Cryptographic verifiable offline QR pass, encrypted emergency credentials card, network disconnect simulation toggle, and printable offline wallet pass.
12. **Settings & Profile (`/settings`)**: Personal details, emergency contacts, consent & privacy manager (DPDP Act compliance), and immutable access audit history.

---

## 🎨 Design System

- **Primary Color**: Deep Institutional Blue (`#0F4C81`) conveying authority and trust.
- **Secondary Colors**: Healthcare Teal (`#0D9488`) and Emerald Green (`#059669`) for positive vitals and verified credentials.
- **Emergency Accent**: Crimson Red (`#DC2626`) strictly reserved for emergency actions, active sirens, and drug allergy warnings.
- **Pure Vanilla CSS**: Built with native CSS custom properties (`tokens.css`, `components.css`, `layout.css`, `app.css`), zero Tailwind dependencies.
- **Typography**: Google Font `Inter` with accessible line heights and weights.
- **Responsive**: Fully optimized for Desktop (1440px), Tablet (768px), and Mobile (375px) with a persistent thumb-accessible mobile bottom navigation bar.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone repository
git clone https://github.com/iamvijayvarma/HEALTH-WALLET-2.0.git

# Navigate into directory
cd HEALTH-WALLET-2.0

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Security & Privacy Architecture
- **DPDP Act & ABDM Alignment**: Granular citizen consent manager governing diagnostic data federation.
- **Zero Unapproved Data Sharing**: Patient records are never shared without verified per-transaction OTP consent.
- **Offline Cryptography**: Emergency triage credentials can be scanned and verified by licensed hospital scanners without network connectivity.
