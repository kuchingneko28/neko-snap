import React from 'react';

export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label className="switch">
        <input type="checkbox" checked={darkMode} onChange={onToggle} />
        <span className="slider"></span>
      </label>
      <span style={{ fontSize: 20 }}>
        {darkMode ? '🌙' : '☀️'}
      </span>
    </div>
  );
}

// CSS for the switch should be added to index.css:
// .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
// .switch input { opacity: 0; width: 0; height: 0; }
// .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #2196F3; transition: .4s; border-radius: 34px; }
// .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
// input:checked + .slider { background-color: #333; }
// input:checked + .slider:before { transform: translateX(22px); } 