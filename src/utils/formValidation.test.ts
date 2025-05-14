
import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isNotEmpty,
  validateLoginForm,
  validateRegisterForm
} from './formValidation';

describe('Form Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('123456')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false); // Too short
      expect(isValidPassword('     ')).toBe(false); // Just spaces
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNotEmpty('text')).toBe(true);
      expect(isNotEmpty('a')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
    });
  });

  describe('validateLoginForm', () => {
    it('should validate a correct login form', () => {
      const result = validateLoginForm('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should fail with empty email', () => {
      const result = validateLoginForm('', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter your email');
    });

    it('should fail with invalid email', () => {
      const result = validateLoginForm('notemail', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should fail with empty password', () => {
      const result = validateLoginForm('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a password');
    });

    it('should fail with short password', () => {
      const result = validateLoginForm('test@example.com', '12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
    });
  });

  describe('validateRegisterForm', () => {
    it('should validate a correct registration form', () => {
      const result = validateRegisterForm('Test User', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should fail with empty name', () => {
      const result = validateRegisterForm('', 'test@example.com', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter your name');
    });

    it('should fail with mismatched passwords', () => {
      const result = validateRegisterForm('Test User', 'test@example.com', 'password123', 'different');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords don\'t match');
    });

    it('should fail when using invalid email', () => {
      const result = validateRegisterForm('Test User', 'notemail', 'password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });
});
