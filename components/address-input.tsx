import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "./ui/command";

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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (locked) return;
    setQuery(value);
    setResults([]);
  }, [value, locked, disabled]);

  useEffect(() => {
    if (
      !query ||
      locked ||
      disabled ||
      query.length < 3 ||
      !hasUserInteracted
    ) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query,
          )}&limit=5`,
          { signal: controller.signal },
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

    // Debounce the API call to avoid excessive requests
    const debounceTimer = setTimeout(() => {
      fetchAddresses();
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [query, locked, disabled, hasUserInteracted]);

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

          if (!hasUserInteracted) {
            setHasUserInteracted(true);
          }

          if (locked && val === query) {
            return;
          }

          if (locked && val !== query) {
            setLocked(false);
          }

          setQuery(val);
          onChange(val);

          if (val !== value || val.length < 3) {
            setResults([]);
          }
        }}
        onFocus={() => {
          if (!locked && query.length >= 3) {
            if (!hasUserInteracted) {
              setHasUserInteracted(true);
            }
          } else {
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
            <CommandEmpty>No address found</CommandEmpty>
            <CommandGroup heading="Suggested address">
              {results.map((r) => {
                const formatted = `${r.properties.name}, ${r.properties.postcode} ${r.properties.city}`;

                return (
                  <CommandItem
                    key={formatted}
                    onSelect={() => selectAddress(r)}
                  >
                    {formatted}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
