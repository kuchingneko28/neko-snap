import { Upload, PlayCircle } from "lucide-react";
import Input from "./Input";

export default function ControlsPanel({ file, onFileChange, cols, setCols, rows, setRows, canvasWidth, setCanvasWidth, background, setBackground, onGenerate, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-center gap-3 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all">
          <Upload className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-100">{file ? "Change Video" : "Upload Video"}</span>
          <input type="file" accept="video/mp4,video/webm,video/ogg,video/x-matroska" onChange={onFileChange} className="hidden" />
        </label>

        <button
          onClick={onGenerate}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition duration-200 shadow-sm ${
            loading ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-400"
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          {loading ? "Processing..." : "Generate"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Columns" value={cols} setValue={setCols} min={1} max={10} />
        <Input label="Rows" value={rows} setValue={setRows} min={1} max={10} />
        <Input label="Canvas Width (px)" value={canvasWidth} setValue={setCanvasWidth} min={320} max={2160} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-100">Background Color:</label>
        <select
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          className="w-full sm:w-60 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="black">Black</option>
          <option value="white">White</option>
        </select>
      </div>
    </div>
  );
}
