import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { createAddress, getAddresses } from "../services/address.service";
import { Address } from "../types/address.types";

export const ADDRESSES_QUERY_KEY = ["addresses"];

export function useAddresses(enabled: boolean = true) {
  return useCustomQuery<Address[]>(ADDRESSES_QUERY_KEY, (signal) => getAddresses(signal), {
    enabled,
    staleTime: 0,
  });
}

export function useCreateAddress() {
  return useCustomMutation(createAddress, {
    mutationKey: ["createAddress"],
    invalidateQueries: [ADDRESSES_QUERY_KEY],
    successMessage: "Address saved",
  });
}
