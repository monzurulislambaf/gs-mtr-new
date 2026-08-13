import { ContactInput } from '@/types/contact';

const PHONE_REGEX = /^[\d\s+\-()]{7,20}$/;

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

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
