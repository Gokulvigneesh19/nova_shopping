export type AddressType = "home" | "work" | "other";

export interface AddressPayload {
  address_type: AddressType;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Address extends AddressPayload {
  id: string;
  created_at?: string;
  updated_at?: string;
}
