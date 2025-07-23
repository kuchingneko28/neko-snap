# 🐱 NekoSnap

**NekoSnap** is a simple and fast tool to generate thumbnail grids from video files (like `.mp4`, `.mkv`, `.webm`). With just a few clicks, you can create clean, customizable contact sheets — perfect for previews, archives, or sharing.

## ✨ Features

- 🖼️ Generate thumbnail grids (custom rows & columns)
- 🎥 Supports popular video formats: `.mp4`, `.mkv`, `.webm`, and more
- 🎟️ Adjustable thumbnail width for high-res grids
- ⚡ Fully client-side (privacy friendly, no uploads)
- 📸 Export thumbnail sheet as high-quality PNG

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kuchingneko28/nekosnap.git
cd nekosnap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the App

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/
│   ├── ControlsPanel.jsx
│   ├── Input.jsx
│   ├── ThumbnailPreview.jsx
├── utils/
│   ├── captureFrame.js
│   ├── formatTime.js
├── App.jsx
├── main.jsx
```

## 📓 License

MIT License
