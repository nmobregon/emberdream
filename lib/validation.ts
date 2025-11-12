import validator from "validator";
import { countries } from "@/app/_data/countries";

export interface CandleInput {
  name: string;
  wish: string;
  country: string;
  color?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: CandleInput;
}

// Get valid country codes from countries list
const VALID_COUNTRIES = countries.map((c) => c.code);

export function validateCandleInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { valid: false, errors: ["Invalid input format"] };
  }

  const data = input as Record<string, unknown>;

  // Validate name
  if (typeof data.name !== "string") {
    errors.push("Name must be a string");
  } else if (data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.length > 50) {
    errors.push("Name must be 50 characters or less");
  } else if (!validator.matches(data.name, /^[a-zA-Z0-9\s\-_.']+$/u)) {
    errors.push("Name contains invalid characters");
  }

  // Validate wish
  if (typeof data.wish !== "string") {
    errors.push("Wish must be a string");
  } else if (data.wish.trim().length === 0) {
    errors.push("Wish is required");
  } else if (data.wish.length > 280) {
    errors.push("Wish must be 280 characters or less");
  }

  // Validate country
  if (typeof data.country !== "string") {
    errors.push("Country must be a string");
  } else if (!VALID_COUNTRIES.includes(data.country)) {
    errors.push("Invalid country code");
  }

  // Validate color (optional)
  let sanitizedColor = "#ff9224"; // default
  if (data.color && typeof data.color === "string") {
    if (!validator.isHexColor(data.color)) {
      errors.push("Invalid color format (must be hex color)");
    } else {
      sanitizedColor = data.color;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize HTML to prevent XSS
  return {
    valid: true,
    errors: [],
    sanitized: {
      name: validator.escape(data.name as string).trim(),
      wish: validator.escape(data.wish as string).trim(),
      country: data.country as string,
      color: sanitizedColor,
    },
  };
}

