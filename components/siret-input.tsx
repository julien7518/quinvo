import { formatSiret, parseSiret } from "@/lib/format";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
};

export function SiretInput({
  value,
  onChange,
  error,
  disabled,
  id,
  placeholder,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>SIRET</Label>
      <Input
        id={id}
        value={formatSiret(value)}
        onChange={(e) => onChange(parseSiret(e.target.value))}
        placeholder={formatSiret(placeholder ? placeholder : "12345678901234")}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
