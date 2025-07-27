import React from "react";

export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-block w-12 h-7">
        <input type="checkbox" checked={darkMode} onChange={onToggle} className="opacity-0 w-0 h-0" />
        <span
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-400 rounded-full ${
            darkMode ? "bg-gray-600" : "bg-gray-300"
          } before:absolute before:content-[''] before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-400 before:rounded-full ${darkMode ? "before:translate-x-5" : "before:translate-x-0"}`}
        ></span>
      </label>
      <span className="text-xl">{darkMode ? "🌙" : "☀️"}</span>
    </div>
  );
}
