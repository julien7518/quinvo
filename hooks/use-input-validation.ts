import { useState } from "react";

export type ClientErrors = {
  company?: string;
  siret?: string;
  address?: string;
  phone?: string;
};

export function useInputValidation() {
  const [errors, setErrors] = useState<ClientErrors>({});

  const validateClientForm = (data: {
    company?: string;
    siret?: string;
    address?: string;
    phone?: string;
  }): boolean => {
    const newErrors: ClientErrors = {};

    if (data.company !== undefined && !data.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (data.siret !== undefined && data.siret.length !== 14) {
      newErrors.siret = "SIRET must contain exactly 14 digits";
    }

    if (data.address !== undefined && !data.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (data.phone !== undefined && data.phone.length !== 9) {
      newErrors.phone = "Phone number must contain exactly 10 numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateClientForm, setErrors };
}
