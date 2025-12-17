import { useEffect, useRef, useCallback } from "react";

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing your address...",
  className = "",
  required = false,
  id = "address",
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Memoize onChange to prevent effect re-runs
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const initAutocomplete = () => {
      if (!window.google?.maps?.places || autocompleteRef.current) return;

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          input,
          {
            types: ["address"],
            componentRestrictions: { country: "us" },
            fields: ["formatted_address"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place?.formatted_address) {
            // Update the input value directly
            input.value = place.formatted_address;
            // Notify React of the change
            onChangeRef.current(place.formatted_address);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Google Places Autocomplete:", err);
      }
    };

    // Try to init immediately
    initAutocomplete();

    // If not loaded yet, poll for it
    if (!window.google?.maps?.places) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          initAutocomplete();
          clearInterval(interval);
        }
      }, 100);

      const timeout = setTimeout(() => clearInterval(interval), 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Set initial value
  useEffect(() => {
    if (inputRef.current && value && !inputRef.current.value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInput = useCallback((e) => {
    onChangeRef.current(e.target.value);
  }, []);

  // Prevent form submission on Enter when dropdown is open
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const pacContainer = document.querySelector(".pac-container");
      if (pacContainer && getComputedStyle(pacContainer).display !== "none") {
        e.preventDefault();
      }
    }
  }, []);

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="off"
        required={required}
        defaultValue={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`${className} pl-11`}
        placeholder={placeholder}
      />
    </div>
  );
}
