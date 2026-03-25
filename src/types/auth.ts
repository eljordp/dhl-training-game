export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: "employee" | "manager";
  created_at: string;
  consent_given?: boolean;
  consent_date?: string | null;
}
