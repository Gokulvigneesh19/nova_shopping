import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { Customer } from "@/features/customers/types/customer.types";

export interface customerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}
export interface CustomerResponse {
  message: string;
  users: Customer[];
  users_count: number;
  average_spent: number;
  paying_customers: number;
  total_spent: number;
  
}

export const getCustomers = (params?: customerQueryParams, signal?: AbortSignal) => {
  return request<CustomerResponse>(API.users.customers, {
    method: "GET",
    body: params,
    signal,
  });
};
