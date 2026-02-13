# 🎂 Birthday Surprise Web App 🎉

> An over-engineered birthday surprise built with 3D graphics and hand tracking AI.

---

## 📖 Overview

This project is a 3D interactive birthday web application featuring:

- 🎬 Dramatic terminal-style intro
- 🎨 3D birthday cake scene
- 🕯️ Interactive candles
- 🤖 Hand tracking to blow candles (via camera)
- 🎉 Confetti celebration effects
- 💌 Custom birthday card popup

Instead of giving a regular birthday card…  
I built a full web application. Naturally.

---

## 🚀 Live Demo (Deploy First)

Camera access requires **HTTPS or localhost**.  
Do NOT open using `file://`.

### Recommended Deployment Options

#### 1️⃣ GitHub Pages (Best Option)

1. Create a new repository on GitHub  
2. Upload:
   - `index.html`
   - `README.md`
   - All image assets
3. Go to:
   ```
   Settings → Pages
   Source: main branch
   Folder: / (root)
   ```
4. Your site will be live at:
   ```
   https://your-username.github.io/repository-name/
   ```

HTTPS will be enabled automatically.

---

#### 2️⃣ Netlify Drop (Fastest)

1. Visit: https://app.netlify.com/drop  
2. Drag & drop your project folder  
3. Get instant HTTPS link  

---

#### 3️⃣ Local Testing (VS Code)

Install **Live Server** extension.

Right-click `index.html` → **Open with Live Server**

---

#### 4️⃣ Python HTTP Server

```bash
cd project-folder
python -m http.server 8000
```

Open:

```
http://localhost:8000
```

---

## 🎮 How to Use

| Action | Method |
|--------|--------|
| Rotate scene | Click + drag mouse |
| Open birthday card | Click the greeting card |
| Enable camera | Click "Start Camera" |
| Blow candles | Close fingertips together for 2 seconds |
| Debug mode | Press `Ctrl + D` |

### 🎯 Best Way to Blow Candles
Bring all fingertips together (like holding a coin)  
Hold steady in front of the camera for ~2 seconds.

---

## 🔧 Troubleshooting

### ❌ Camera Access Denied
- Must use HTTPS or localhost
- Check browser camera permissions

### ❌ Hand Tracking Not Working
- Ensure good lighting
- Make sure hand is fully visible
- Hold gesture steady for 2+ seconds

### ❌ Slow Loading
First load downloads 3D & AI libraries (~20MB).  
Subsequent loads are faster due to caching.

### ❌ Audio Not Playing
Click anywhere on the page first (browser autoplay policy).

---

## 🧠 Technical Stack

- 🎨 **:contentReference[oaicite:0]{index=0}** – 3D rendering engine
- 🤖 **:contentReference[oaicite:1]{index=1}** – Hand tracking AI
- ✨ **:contentReference[oaicite:2]{index=2}** – Smooth animations
- 📜 Vanilla JavaScript
- 🎨 CSS3
- 📄 HTML5

---

## 🎨 Customization

### Edit Terminal Messages
```javascript
const terminalLines = [
  '> initializing connection...',
  '> connecting to favorite person...',
  '> happy birthday!',
];
```

### Edit Birthday Card Content
Modify the HTML inside the birthday card popup section.

### Change Colors
Edit main CSS gradient:
```css
background: radial-gradient(circle at 50% 40%, #1a237e 0%, #000000 80%);
```

### Replace Photos
```html
<img src="your-photo.png">
```

---

## 📱 Compatibility

- ✅ Desktop browsers (recommended)
- ⚠️ Mobile browsers (camera behavior may vary)
- ❌ Internet Explorer (please no)

---

## 📜 License

Licensed under:

**"Please Don't Judge My Code" License**

- Free to modify
- Free to use for loved ones
- No warranty
- No judging allowed

---

## 💝 Final Note

This project exists because:

Regular birthday cards are boring.  
3D candles + AI hand tracking + confetti are not.

Happy Birthday 🎂✨

---

**Built with questionable decisions and good intentions.**
