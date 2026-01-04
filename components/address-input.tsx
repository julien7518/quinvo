import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type AddressFeature = {
  properties: {
    name: string;
    postcode: string;
    city: string;
  };
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
};

export function AddressInput({
  value,
  onChange,
  error,
  disabled,
  id,
  placeholder,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressFeature[]>([]);
  const [locked, setLocked] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (locked) return;
    setQuery(value);
    setResults([]);
    setActiveIndex(-1);
  }, [value, locked]);

  useEffect(() => {
    if (!query || locked || disabled) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
          )}&limit=5`,
          { signal: controller.signal }
        );

        if (!res.ok) return;

        const data = await res.json();
        setResults(data.features ?? []);
        setActiveIndex(-1);
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Address fetch failed", error);
      }
    };

    fetchAddresses();

    return () => controller.abort();
  }, [query, locked, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !results.length || locked) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectAddress(results[activeIndex]);
    }
  };

  const selectAddress = (feature: AddressFeature) => {
    const formatted = `${feature.properties.name}, ${feature.properties.postcode} ${feature.properties.city}`;
    setQuery(formatted);
    onChange(formatted);
    setResults([]);
    setLocked(true);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={id}>Address</Label>

      <Input
        id={id}
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          if (locked && val === query) {
            // Prevent unlocking or fetching if input value hasn't changed
            return;
          }
          if (locked && val !== query) {
            // User actively changed the input, unlock and update
            setLocked(false);
          }
          setQuery(val);
          if (val !== value) {
            setResults([]);
            setActiveIndex(-1);
          }
          onChange(val);
        }}
        onFocus={() => {
          if (!locked) {
            // Do nothing, suggestions will show if query is not empty
          } else {
            // If locked, clear suggestions to prevent them showing on focus
            setResults([]);
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />

      {!disabled && results.length > 0 && (
        <div className="absolute z-10 w-full border rounded-md bg-white shadow-md">
          <ul>
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => selectAddress(r)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === activeIndex ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                {r.properties.name}, {r.properties.postcode} {r.properties.city}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
