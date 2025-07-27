export default function Input({ label, value, setValue, min, max }) {
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

    if (value === "" || isNaN(value)) {
      finalValue = min;
    }

    if (finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;

    setValue(finalValue);
  };

  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
      {label}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-gray-100"
      />
    </label>
  );
}
