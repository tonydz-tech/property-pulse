"use client";

import { useEffect, useRef, useState } from "react";
import { fieldInputClass } from "./form-field";

type Suggestion = {
  formattedAddress: string;
};

type GeoapifyResult = {
  formatted: string;
};

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export function AddressAutocomplete({
  id,
  name,
  defaultValue = "",
  required,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!GEOAPIFY_KEY || query.trim().length < 3) {
      debounceRef.current = setTimeout(() => setSuggestions([]), 0);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
          )}&countrycodes=us&limit=5&format=json&apiKey=${GEOAPIFY_KEY}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const results: GeoapifyResult[] = data.results ?? [];
        setSuggestions(
          results.map((result) => ({ formattedAddress: result.formatted }))
        );
        setActiveIndex(-1);
      } catch {
        // Silently ignore — the field still works as a plain text input.
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function selectSuggestion(suggestion: Suggestion) {
    setQuery(suggestion.formattedAddress);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="text"
        required={required}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={fieldInputClass}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border border-hairline bg-paper shadow-sm">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.formattedAddress}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === activeIndex
                    ? "bg-moss/10 text-ink"
                    : "text-ink/80 hover:bg-moss/10"
                }`}
              >
                {suggestion.formattedAddress}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
