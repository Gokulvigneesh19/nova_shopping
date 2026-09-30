export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_code?: string | null;
  phone_number?: string | null;
  total_orders?: number;
  total_spent?:  number;
  created_at: string;
  orders?: number;
  is_host?: boolean;
};
