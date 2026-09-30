export type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  is_active?: boolean;
};

export interface CategoryPayload {
  name: string;
  description: string;
  is_active: boolean;
  image?: File | null;
}
