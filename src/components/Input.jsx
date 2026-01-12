import { Minus, Plus } from "lucide-react";

export default function Input({ label, value, setValue, min, max, step = 1 }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setValue("");
    } else {
      const val = parseInt(raw);
      if (!isNaN(val)) setValue(val);
    }
  };

  const handleBlur = () => {
    let finalValue = value;
    if (value === "" || isNaN(value)) finalValue = min;
    if (finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    setValue(finalValue);
  };

  const increment = () => {
    const newVal = (parseInt(value) || 0) + step;
    if (max === undefined || newVal <= max) setValue(newVal);
  };

  const decrement = () => {
    const newVal = (parseInt(value) || 0) - step;
    if (newVal >= min) setValue(newVal);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ctp-overlay1 ml-1">{label}</label>
      <div className="flex items-center">
        <button
          onClick={decrement}
          className="w-9 h-9 flex items-center justify-center bg-ctp-mantle hover:bg-ctp-surface0 text-ctp-subtext1 rounded-l-xl border-y border-l border-ctp-surface1 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="
            block w-full h-9 text-center bg-ctp-base
            border-y border-ctp-surface1
            text-sm font-semibold text-ctp-text
            focus:outline-none focus:border-ctp-blue focus:ring-1 focus:ring-ctp-blue z-10
            appearance-none
          "
        />
        <button
          onClick={increment}
          className="w-9 h-9 flex items-center justify-center bg-ctp-mantle hover:bg-ctp-surface0 text-ctp-subtext1 rounded-r-xl border-y border-r border-ctp-surface1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
