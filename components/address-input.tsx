import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Command, CommandList, CommandItem } from "./ui/command";

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

  useEffect(() => {
    if (locked) return;
    setQuery(value);
    setResults([]);
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
      />

      {!disabled && results.length > 0 && (
        <Command className="absolute w-full z-50 h-fit">
          <CommandList>
            {results.map((r) => {
              const formatted = `${r.properties.name}, ${r.properties.postcode} ${r.properties.city}`;

              return (
                <CommandItem key={formatted} onSelect={() => selectAddress(r)}>
                  {formatted}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
