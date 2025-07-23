import { Upload, PlayCircle } from "lucide-react";
import Input from "./Input";

export default function ControlsPanel({ file, onFileChange, cols, setCols, rows, setRows, thumbWidth, setThumbWidth, background, setBackground, onGenerate, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-center gap-3 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 rounded-xl cursor-pointer transition-all">
          <Upload className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">{file ? "Change Video" : "Upload Video"}</span>
          <input type="file" accept="video/mp4,video/webm,video/ogg,video/x-matroska" onChange={onFileChange} className="hidden" />
        </label>

        <button
          onClick={onGenerate}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition duration-200 shadow-sm ${
            loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-400"
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          {loading ? "Processing..." : "Generate"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Columns" value={cols} setValue={setCols} min={1} max={10} />
        <Input label="Rows" value={rows} setValue={setRows} min={1} max={10} />
        <Input label="Thumbnail Width (px)" value={thumbWidth} setValue={setThumbWidth} min={100} max={3000} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Background Color:</label>
        <select value={background} onChange={(e) => setBackground(e.target.value)} className="w-full sm:w-60 px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </div>
    </div>
  );
}
