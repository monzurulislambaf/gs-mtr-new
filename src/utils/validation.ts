import { ContactInput } from '@/types/contact';
import { RegistrationInput } from '@/types/auth';

const PHONE_REGEX = /^[\d\s+\-()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BD_NUMBER_REGEX = /^\d{4,10}$/;
const BD_MOBILE_REGEX = /^01\d{9}$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateContact(data: Partial<ContactInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data['BD NO'] && data['BD NO'].trim() && data['BD NO'].length < 3) {
    errors.push({ field: 'BD NO', message: 'BD Number must be at least 3 characters' });
  }

  if (data.NAME && data.NAME.trim() && data.NAME.length < 2) {
    errors.push({ field: 'NAME', message: 'Name must be at least 2 characters' });
  }

  if (data['SERVICE MOBILE'] && !PHONE_REGEX.test(data['SERVICE MOBILE'])) {
    errors.push({ field: 'SERVICE MOBILE', message: 'Invalid phone number format' });
  }

  if (data['PERSONAL MOBILE'] && !PHONE_REGEX.test(data['PERSONAL MOBILE'])) {
    errors.push({ field: 'PERSONAL MOBILE', message: 'Invalid phone number format' });
  }

  return errors;
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/** Client-side validation for the Request Registration form. */
export function validateRegistration(
  data: RegistrationInput,
  confirmPassword: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.fullName.trim()) {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
  } else if (data.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full Name must be at least 2 characters' });
  }

  if (!data.bdNumber.trim()) {
    errors.push({ field: 'bdNumber', message: 'BD Number is required' });
  } else if (!BD_NUMBER_REGEX.test(data.bdNumber.trim())) {
    errors.push({ field: 'bdNumber', message: 'BD Number must be 4-10 digits' });
  }

  if (!data.rank.trim()) {
    errors.push({ field: 'rank', message: 'Rank is required' });
  }

  if (!data.branch.trim()) {
    errors.push({ field: 'branch', message: 'Branch/Trade is required' });
  }

  if (!data.commissionDate) {
    const dateLabel = data.category === 'Officer' ? 'Date of Commission' : 'Date of Enrolment';
    errors.push({ field: 'commissionDate', message: `${dateLabel} is required` });
  }

  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: 'email', message: 'Enter a valid email address' });
  }

  if (!data.mobile.trim()) {
    errors.push({ field: 'mobile', message: 'Mobile Number is required' });
  } else if (!BD_MOBILE_REGEX.test(data.mobile.trim().replace(/[\s-]/g, ''))) {
    errors.push({ field: 'mobile', message: 'Enter a valid 11-digit mobile number (01XXXXXXXXX)' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (data.password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
