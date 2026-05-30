import React, { useEffect, useRef, useState } from "react";

const RECENT_LIMIT = 6;

const arraysEqual = (a = [], b = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const SearchAutocomplete = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "Search...",
  className = "",
  storageKey,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setRecent(Array.isArray(items) ? items.slice(0, RECENT_LIMIT) : []);
    } catch (err) {
      setRecent([]);
    }
  }, [storageKey]);

  const persistRecent = (selectedValue) => {
    if (!storageKey || !selectedValue) return;
    try {
      const next = [selectedValue, ...recent.filter((item) => item !== selectedValue)].slice(0, RECENT_LIMIT);
      setRecent(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (err) {
      // ignore storage errors in UI-only autocomplete
    }
  };

  const chooseValue = (selectedValue) => {
    onChange(selectedValue);
    persistRecent(selectedValue);
    onSelect?.(selectedValue);
    setOpen(false);
  };

  useEffect(() => {
    if (!value) {
      setFiltered((prev) => (prev.length === 0 ? prev : []));
      setOpen((prev) => (prev === (recent.length > 0) ? prev : recent.length > 0));
      setActive((prev) => (prev === -1 ? prev : -1));
      return;
    }
    const q = value.toLowerCase();
    const list = suggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
    setFiltered((prev) => (arraysEqual(prev, list) ? prev : list));
    setOpen((prev) => (prev === (list.length > 0) ? prev : list.length > 0));
    setActive((prev) => (prev === -1 ? prev : -1));
  }, [value, suggestions]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (active >= 0 && active < filtered.length) {
        chooseValue(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (!value && (recent.length > 0 || suggestions.length > 0)) {
            setOpen(true);
          } else if (filtered.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && !value && recent.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-white border border-gray-200 shadow-lg p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  chooseValue(item);
                }}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {open && filtered.length > 0 && value && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg bg-white border border-gray-200 shadow-lg max-h-56 overflow-auto">
          {filtered.map((s, idx) => (
            <li
              key={s + idx}
              onMouseDown={(e) => {
                e.preventDefault();
                chooseValue(s);
              }}
              onMouseEnter={() => setActive(idx)}
              className={`px-3 py-2 cursor-pointer text-sm ${active === idx ? 'bg-primary-50 text-primary' : 'hover:bg-gray-50'}`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchAutocomplete;
