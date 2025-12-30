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

export function AddressInput({
  value,
  onChange,
  error,
  disabled,
  id,
  placeholder,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Address</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
