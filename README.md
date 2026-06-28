<div align="center">

<img src="https://raw.githubusercontent.com/SeongjunLee4473/pixlit/main/favicon.svg" width="64" height="64" alt="Pixlit logo" />

# Pixlit

**Convert & compress images instantly — right in your browser.**

HEIC to JPG conversion · PNG/JPG/WebP compression · Batch processing · ZIP download

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pixlit--five.vercel.app-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://pixlit-five.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

<br />

<img src="https://raw.githubusercontent.com/SeongjunLee4473/pixlit/main/docs/mockup-mobile.png" width="320" alt="Pixlit on iPhone" />

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔄 **HEIC → JPG** | Convert iPhone photos to universally compatible JPG |
| 🗜️ **Image Compression** | Compress PNG / JPG / WebP with a quality slider |
| 📦 **Batch Processing** | Handle multiple files at once |
| ⬇️ **ZIP Download** | Download all converted files in one click |
| 👁️ **Before / After Preview** | See file size savings in real time |
| 🌐 **Bilingual UI** | Toggle between English and Korean |
| 📱 **Fully Responsive** | Works seamlessly on desktop and mobile |

---

## 🔒 Privacy First

> **Your files never leave your device.**

Pixlit runs entirely in the browser using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and the [heic2any](https://github.com/alexcorvi/heic2any) library. No server. No upload. No account required.

```
Your file  →  Browser  →  Converted file
                ↑
         Nothing leaves here
```

---

## 🚀 Quick Start

No installation needed. Just open the link and go.

**[→ Open Pixlit](https://pixlit-five.vercel.app)**

1. Drag & drop your images (or click **Choose Files**)
2. Adjust quality with the slider
3. Click **Convert now**
4. Download individually or as a ZIP

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML · Vanilla JavaScript · CSS |
| HEIC Conversion | [heic2any](https://github.com/alexcorvi/heic2any) (CDN) |
| Image Compression | Canvas API |
| ZIP Packaging | [JSZip](https://stuk.github.io/jszip/) (CDN) |
| Hosting | [Vercel](https://vercel.com) (Free tier, auto-deploy) |
| Contact Form | [Formspree](https://formspree.io) |

No build tools. No npm. No dependencies to install — just open `index.html`.

---

## 📁 Project Structure

```
pixlit/
├── index.html          # Main page — tab UI with both tools
├── favicon.svg
├── sitemap.xml
├── robots.txt
├── css/
│   └── style.css       # All styles, mobile-responsive
├── js/
│   └── main.js         # Core logic — convert, compress, i18n
└── pages/
    ├── about.html
    ├── contact.html
    ├── privacy.html
    └── terms.html
```

---

## 🖥️ Local Development

```bash
git clone https://github.com/SeongjunLee4473/pixlit.git
cd pixlit

# No build step — just open the file
open index.html
# or serve locally
npx serve .
```

---

## 📄 License

MIT © [SeongjunLee4473](https://github.com/SeongjunLee4473)

---

<div align="center">

Made with ☕ · [Live Site](https://pixlit-five.vercel.app) · [Report a Bug](https://github.com/SeongjunLee4473/pixlit/issues)

</div>
