import { useState, useRef, useEffect } from "react";

type Option = {
  value: string | number;
  label: string;
};

type SelectProps = {
  value?: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  // close click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-full flex items-center justify-between
          bg-gray-100 dark:bg-[#17171F]
          px-3 py-2 text-sm
          border border-gray-300 dark:border-gray-700
          rounded-lg
          text-gray-700 dark:text-white
          hover:border-indigo-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          transition
        "
      >
        <span className={`${selected ? "" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>

        <span
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            overflow-hidden
          "
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              No options
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="
                  px-3 py-2 text-sm cursor-pointer
                  text-gray-700 dark:text-white
                  hover:bg-indigo-500/10 dark:hover:bg-gray-800
                  transition flex items-center justify-between
                "
              >
                <span>{option.label}</span>

                {value === option.value && (
                  <span className="text-indigo-500">✓</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}