import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { Address, AddressPayload } from "@/features/addresses/types/address.types";

type AddressListResponse =
  | Address[]
  | { message?: string; addresses?: Address[]; results?: Address[]; data?: Address[] };

type AddressDetailResponse = Address | { message?: string; address?: Address; data?: Address };

// The API may return a bare array or wrap it; normalise to Address[].
export const getAddresses = async (signal?: AbortSignal): Promise<Address[]> => {
  const res = await request<AddressListResponse>(API.users.addresses, {
    method: "GET",
    signal,
  });
  if (Array.isArray(res)) return res;
  return res.addresses ?? res.results ?? res.data ?? [];
};

// Normalise the created address so callers can select it by id.
export const createAddress = async (payload: AddressPayload): Promise<Address> => {
  const res = await request<AddressDetailResponse, AddressPayload>(API.users.addresses, {
    method: "POST",
    body: payload,
  });
  if ("id" in res) return res;
  const address = res.address ?? res.data;
  if (!address) throw new Error("Address was saved but not returned");
  return address;
};
