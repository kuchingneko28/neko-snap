import { Grid3X3, PlayCircle, Settings, Upload } from "lucide-react";
import Input from "./Input";

export default function ControlsPanel({
  files,
  selectedFileId,
  onSelectFile,
  onClearQueue,
  file,
  onFileChange,
  cols,
  setCols,
  rows,
  setRows,
  canvasWidth,
  setCanvasWidth,
  background,
  setBackground,
  onGenerate,
  loading,
}) {
  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-ctp-text flex items-center gap-2">
          <Upload className="w-4 h-4 text-ctp-blue" />
          <span>Video Source</span>
        </label>
        <label
          className={`
          relative flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group
          ${
            file
              ? "border-ctp-blue bg-ctp-blue/5"
              : "border-ctp-surface1 hover:border-ctp-blue/50 hover:bg-ctp-surface0/50"
          }
        `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <Upload
              className={`w-8 h-8 mb-3 transition-colors ${
                file ? "text-ctp-blue" : "text-ctp-overlay1 group-hover:text-ctp-blue"
              }`}
            />
            <p className="mb-1 text-sm text-ctp-subtext1 font-medium">
              {file ? (
                <span className="text-ctp-blue font-semibold truncate max-w-[200px] block">{file.name}</span>
              ) : (
                <>
                  <span className="font-semibold text-ctp-text">Click to upload multiple</span> or drag and drop
                </>
              )}
            </p>
            {!file && <p className="text-xs text-ctp-overlay0">MP4, MKV, WebM</p>}
          </div>
          <input
            type="file"
            multiple
            accept="video/mp4,video/webm,video/ogg,video/x-matroska,video/quicktime"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Queue List */}
      {files && files.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ctp-text flex items-center gap-2">
              <span className="text-ctp-blue font-bold">{files.length}</span> Files in Queue
            </label>
            <button
              onClick={onClearQueue}
              className="text-xs text-ctp-red hover:text-ctp-red/80 font-medium hover:underline transition-all"
            >
              Clear Queue
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {files.map((f) => (
              <div
                key={f.id}
                onClick={() => onSelectFile(f.id)}
                className={`
                  p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between
                  ${
                    selectedFileId === f.id
                      ? "bg-ctp-surface0 border-ctp-blue shadow-sm ring-1 ring-ctp-blue/20"
                      : "bg-ctp-mantle border-ctp-surface1 hover:border-ctp-blue/30 hover:bg-ctp-surface0/50"
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${
                      f.status === "done"
                        ? "bg-ctp-green/10 text-ctp-green"
                        : f.status === "error"
                        ? "bg-ctp-red/10 text-ctp-red"
                        : f.status === "processing"
                        ? "bg-ctp-blue/10 text-ctp-blue animate-pulse"
                        : "bg-ctp-surface1 text-ctp-overlay1"
                    }
                  `}
                  >
                    {f.status === "done" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : f.status === "error" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-sm font-medium truncate ${
                        selectedFileId === f.id ? "text-ctp-text" : "text-ctp-subtext0"
                      }`}
                    >
                      {f.file.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-ctp-overlay0">{f.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-ctp-surface1" />

      {/* Grid Settings */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-ctp-text flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-ctp-blue" />
          <span>Grid Layout</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Columns" value={cols} setValue={setCols} min={1} max={10} />
          <Input label="Rows" value={rows} setValue={setRows} min={1} max={10} />
        </div>
      </div>

      <hr className="border-ctp-surface1" />

      {/* Appearance Settings */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-ctp-text flex items-center gap-2">
          <Settings className="w-4 h-4 text-ctp-blue" />
          <span>Output Settings</span>
        </label>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-ctp-overlay1 ml-1">Resolution</label>
              <div className="flex gap-1.5">
                {[1280, 1920, 3840].map((w) => (
                  <button
                    key={w}
                    onClick={() => setCanvasWidth(w)}
                    className={`
                      px-2 py-0.5 text-[10px] uppercase font-bold rounded-md border transition-all
                      ${
                        canvasWidth === w
                          ? "bg-ctp-blue text-ctp-base border-ctp-blue"
                          : "bg-ctp-surface0 text-ctp-subtext0 border-ctp-surface1 hover:border-ctp-blue/50 hover:text-ctp-text"
                      }
                    `}
                  >
                    {w === 1280 ? "SD" : w === 1920 ? "HD" : "4K"}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Width (px)" value={canvasWidth} setValue={setCanvasWidth} min={320} max={3840} step={100} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ctp-overlay1 ml-1">Background Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBackground("dark")}
                className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2
                    ${
                      background === "dark"
                        ? "bg-ctp-surface0 border-ctp-blue text-ctp-text ring-1 ring-ctp-blue shadow-sm"
                        : "bg-ctp-mantle border-ctp-surface1 text-ctp-overlay1 hover:border-ctp-surface2"
                    }
                  `}
              >
                <div className="w-3 h-3 rounded-full bg-black border border-gray-600"></div>
                Dark
              </button>
              <button
                onClick={() => setBackground("white")}
                className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2
                    ${
                      background === "white"
                        ? "bg-white border-ctp-blue text-gray-900 ring-1 ring-ctp-blue shadow-sm"
                        : "bg-ctp-mantle border-ctp-surface1 text-ctp-overlay1 hover:border-ctp-surface2"
                    }
                  `}
              >
                <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                Light
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={loading || !file}
          className={`
            w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-200
            ${
              loading || !file
                ? "bg-ctp-surface0 text-ctp-overlay0 cursor-not-allowed border border-ctp-surface1"
                : "bg-linear-to-r from-ctp-blue to-ctp-sapphire hover:from-ctp-blue/90 hover:to-ctp-sapphire/90 text-ctp-base shadow-lg shadow-ctp-blue/20 transform active:scale-[0.98]"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              Generate Contact Sheet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
