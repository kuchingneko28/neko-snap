import { Download } from "lucide-react";

export default function ThumbnailPreview({ compositeUrl, file }) {
  if (!compositeUrl) return null;

  const downloadName = `${file.name.replace(/\.[^/.]+$/, "")}_thumbs.png`;

  return (
    <div className="text-center">
      <img src={compositeUrl} alt="Composite" className="inline-block border shadow-md max-w-full" />
      <div className="mt-6">
        <a href={compositeUrl} download={downloadName} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-500 transition duration-200 shadow-md">
          <Download className="w-5 h-5" />
          Download Image
        </a>
      </div>
    </div>
  );
}
