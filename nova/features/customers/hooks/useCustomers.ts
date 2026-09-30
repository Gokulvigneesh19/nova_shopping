import { keepPreviousData } from "@tanstack/react-query";
import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { customerQueryParams, CustomerResponse, getCustomers } from "../services/customer.service";

export function useCustomers(params?: customerQueryParams) {
  return useCustomQuery<CustomerResponse>(
    ["customers", params],
    (signal) => getCustomers(params, signal),
    {
      placeholderData: keepPreviousData,
    }
  );
}
