# 🐱 NekoSnap

**NekoSnap** is a simple and fast tool to generate thumbnail grids from video files (like `.mp4`, `.mkv`, `.webm`). With just a few clicks, you can create clean, customizable contact sheets — perfect for previews, archives, or sharing.

## ✨ Features

- 🖼️ **Batch Processing**: Upload multiple videos and manage a processing queue.
- 📦 **Bulk Export**: Download all processed contact sheets as a single ZIP file.
- 🛑 **Control**: Cancel processing at any time.
- 🎨 **Modern Theme**: Beautiful **Catppuccin** (Latte/Mocha) UI with dark mode support.
- 📐 **Resolution Presets**: Quick-select buttons for SD, HD, and 4K output.
- 🎥 **Broad Support**: `.mp4`, `.mkv`, `.webm`, and more.
- ⚡ **High Performance**: Smart chunking for large files (tested with 1GB+ videos).
- 🔒 **Client-Side**: 100% private, no server uploads.
- 📸 **High Quality**: Export crystal clear PNG contact sheets.

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
├── App.jsx
├── main.jsx
```

## 📓 License

MIT License
