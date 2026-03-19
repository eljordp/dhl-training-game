export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  role: "employee" | "manager";
  created_at: string;
}
