"use client";

import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  resultCount?: number;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "",
  resultCount,
  className,
}: SearchBarProps) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <InputGroupAddon>
        <Search className="h-4 w-4" />
      </InputGroupAddon>
      {resultCount !== undefined && (
        <InputGroupAddon align="inline-end">
          {resultCount} results
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
