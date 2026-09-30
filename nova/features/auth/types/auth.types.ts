export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  phone_code: string;
  phone_number: string;
  email: string;
  password: string;
  confirm_password: string;
}
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_code: string | null;
  phone_number: string | null;
  address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  postal_code: string | null;
  is_host?: boolean;
  cart_count?: number;
}

// Editable contact fields; PATCH sends only the ones that changed. Addresses live in /addresses/.
export type ProfileUpdatePayload = Partial<
  Pick<SignupPayload, "first_name" | "last_name" | "email" | "phone_code" | "phone_number">
>;

export interface AuthResponse {
  status: boolean;
  message: string;
  statusCode?: number;
  refresh: string;
  access: string;
  user?: User;
  count?: number;
}
