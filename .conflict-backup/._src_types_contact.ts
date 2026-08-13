export interface Contact {
  id: string;
  'BD NO': string;
  RANK: string;
  NAME: string;
  DESIGNATION: string;
  'BRANCH / TRADE': string;
<<<<<<< HEAD
  'OFFICE ADDRESS': string;
  'RESIDENCE ADDRESS': string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
  'OFFICE TELEPHONE': string;
  'PERSONAL TELEPHONE': string;
=======
  OFFICE: string;
  RESIDENCE: string;
  'SERVICE MOBILE': string;
  'PERSONAL MOBILE': string;
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
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
<<<<<<< HEAD
  'OFFICE ADDRESS'?: string;
  'RESIDENCE ADDRESS'?: string;
  'SERVICE MOBILE'?: string;
  'PERSONAL MOBILE'?: string;
  'OFFICE TELEPHONE'?: string;
  'PERSONAL TELEPHONE'?: string;
=======
  OFFICE?: string;
  RESIDENCE?: string;
  'SERVICE MOBILE'?: string;
  'PERSONAL MOBILE'?: string;
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  REMARKS?: string;
}

export interface ContactRow {
  id: string;
  bd_no: string;
  rank: string;
  name: string;
  designation: string;
  branch_trade: string;
<<<<<<< HEAD
  office_address: string;
  residence_address: string;
  service_mobile: string;
  personal_mobile: string;
  office_telephone: string;
  personal_telephone: string;
=======
  office: string;
  residence: string;
  service_mobile: string;
  personal_mobile: string;
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
  remarks: string;
  created_at: number;
  updated_at: number;
  deleted: number;
  version: number;
  favorite: number;
<<<<<<< HEAD
}
=======
}
>>>>>>> 976be18251497c7c9549b752f4e9178f5f669dd0
