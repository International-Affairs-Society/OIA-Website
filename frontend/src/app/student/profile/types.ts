export interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  photo_uri: string | null;
  mobile: string;
}

export interface StudentRecord {
  id: string;
  user_id: string;
  enrollment_id: string;
  department: string;
  batch_year: number;
  program_type: string;
}

export type ApplicationStage = "applied" | "documents_verified" | "offer_letter" | "visa_docs" | "enrolled";

export interface Application {
  id: string;
  user_id: string;
  program_id: string;
  stage: ApplicationStage;
  fee_paid: boolean;
  departure_date: string;
  applied_at: string;
}

export type DocumentType = "passport" | "aadhaar" | "transcript" | "sop" | "bank_statement" | "photo" | "vaccination";
export type DocumentStatus = "verified" | "pending" | "not_uploaded";

export interface Document {
  id: string;
  user_id: string;
  application_id: string;
  type: DocumentType;
  status: DocumentStatus;
  r2_key: string | null;
  verified_at: string | null;
}

export interface Notification {
  id: string;
  subject: string;
  body_html: string;
  sent_at: string;
  read: boolean;
  application_id?: string;
}

export interface POC {
  name: string;
  designation: string;
  email: string;
  contactNumber: string;
}

export interface Program {
  id: string;
  title: string;
  country: string;
  duration: string;
  fee: number;
  poc?: POC;
}

export interface StageHistory {
  id: string;
  application_id: string;
  from_stage: ApplicationStage | null;
  to_stage: ApplicationStage;
  note: string;
  changed_at: string;
}

export interface ApplicationComment {
  id: string;
  application_id: string;
  sender: "admin" | "student";
  text: string;
  media_url?: string;
  created_at: string;
}
