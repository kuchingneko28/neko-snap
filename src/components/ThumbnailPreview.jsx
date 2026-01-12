import { Download } from "lucide-react";

export default function ThumbnailPreview({ compositeUrl, file }) {
  if (!compositeUrl) return null;

  const downloadName = `${file.name.replace(/\.[^/.]+$/, "")}_neko_snap.png`;

  return (
    <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-300">
      <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-ctp-base ring-1 ring-black/5 dark:ring-white/10">
        {/* Preview Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
          <a
            href={compositeUrl}
            download={downloadName}
            className="px-4 py-2 bg-ctp-base/90 backdrop-blur-sm text-ctp-text rounded-lg text-sm font-medium shadow-sm hover:bg-ctp-surface0 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save Image
          </a>
        </div>

        <img src={compositeUrl} alt="Contact Sheet Preview" className="w-full h-auto block" />
      </div>

      <div className="mt-6 flex justify-center pb-8 lg:pb-0">
        <a
          href={compositeUrl}
          download={downloadName}
          className="
            inline-flex items-center gap-2 px-8 py-3
            bg-ctp-text text-ctp-base
            rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5
            transition-all duration-200
          "
        >
          <Download className="w-5 h-5" />
          Download Full Res
        </a>
      </div>
    </div>
  );
}
