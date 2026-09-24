import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  icon: TriggerIcon,
  variant = "pill", // "pill" | "input"
  align = "right", // "left" | "right"
  className = "",
  buttonClassName = "",
  menuClassName = "",
  label = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const isPill = variant === "pill";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer ${
          isPill
            ? "bg-white border border-slate-200/90 hover:border-slate-300 rounded-full px-3.5 py-1.5 shadow-2xs hover:shadow-xs text-xs sm:text-sm font-semibold text-slate-800"
            : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none text-xs sm:text-sm text-slate-900 shadow-2xs"
        } ${isOpen ? "ring-2 ring-slate-900/10 border-slate-400" : ""} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {TriggerIcon && (
            <TriggerIcon className="text-slate-400 text-xs shrink-0 group-hover:text-slate-600 transition-colors" />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-xs text-slate-500">{selectedOption.icon}</span>
          )}
          <span className="truncate text-slate-800 font-semibold">
            {selectedOption?.label || placeholder}
          </span>
        </div>

        <FaChevronDown
          className={`text-[10px] text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-slate-800" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 min-w-[200px] sm:min-w-[220px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-1.5 origin-top animate-fade-in-up duration-150 ${
            align === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
        >
          <div className="space-y-0.5 max-h-60 overflow-y-auto scrollbar-none py-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              const OptionIcon = option.iconComponent;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-medium transition-all duration-150 group ${
                    isSelected
                      ? "bg-slate-900 text-white font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {OptionIcon ? (
                      <OptionIcon
                        className={`text-xs shrink-0 transition-colors ${
                          isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                    ) : option.icon ? (
                      <span className="text-xs shrink-0">{option.icon}</span>
                    ) : null}

                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span
                          className={`text-[10px] truncate ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <FaCheck className="text-[11px] text-white shrink-0 animate-scale-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
