export interface Contact {
  id: string;
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION: string;
  'BRANCH / TRADE': string;
  'OFFICE ADDRESS': string;
  'RESIDENCE ADDRESS': string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
  'OFFICE TELEPHONE': string;
  'PERSONAL TELEPHONE': string;
  REMARKS: string;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  version: number;
  favorite?: boolean;
}

export interface ContactInput {
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION?: string;
  'BRANCH / TRADE'?: string;
  'OFFICE ADDRESS'?: string;
  'RESIDENCE ADDRESS'?: string;
  'SERVICE MOBILE'?: string;
  'PERSONAL MOBILE'?: string;
  'OFFICE TELEPHONE'?: string;
  'PERSONAL TELEPHONE'?: string;
  REMARKS?: string;
}

export interface ContactRow {
  id: string;
  bd_no: string;
  rank: string;
  name: string;
  designation: string;
  branch_trade: string;
  office_address: string;
  residence_address: string;
  service_mobile: string;
  personal_mobile: string;
  office_telephone: string;
  personal_telephone: string;
  remarks: string;
  created_at: number;
  updated_at: number;
  deleted: number;
  version: number;
  favorite: number;
}
