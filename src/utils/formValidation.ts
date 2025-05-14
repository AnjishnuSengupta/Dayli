
/**
 * Utility functions for form validation
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  return email.trim() !== '' && email.includes('@') && email.includes('.');
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.trim() !== '' && password.length >= 6;
};

// Field validation
export const isNotEmpty = (value: string): boolean => {
  return value.trim() !== '';
};

// Validate login/register form fields
export type FormValidationError = string | null;

export interface ValidationResult {
  isValid: boolean;
  error: FormValidationError;
}

export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  if (!isNotEmpty(email)) {
    return { isValid: false, error: "Please enter your email" };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (!isNotEmpty(password)) {
    return { isValid: false, error: "Please enter a password" };
  }
  
  if (!isValidPassword(password)) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }
  
  return { isValid: true, error: null };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!isNotEmpty(name)) {
    return { isValid: false, error: "Please enter your name" };
  }
  
  const loginValidation = validateLoginForm(email, password);
  if (!loginValidation.isValid) {
    return loginValidation;
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords don't match" };
  }
  
  return { isValid: true, error: null };
};
