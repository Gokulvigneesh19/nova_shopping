import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import {
  AuthResponse,
  LoginPayload,
  SignupPayload,
} from "../types/auth.types";

export const loginApi = (payload: LoginPayload, signal?: AbortSignal) => {
  return request<AuthResponse>(API.auth.login, {
    method: "POST",
    body: payload,
  });
};

export const signup = (payload: SignupPayload, signal?: AbortSignal) => {
  return request<AuthResponse>(API.auth.register, {
    method: "POST",
    body: payload,
  });
};

export const getUserProfile = (signal?: AbortSignal) => {
  return request<AuthResponse>(API.users.profile, {
    method: "GET",
    signal,
  });
};

export const getCartCount = (signal?: AbortSignal) => {
  return request<AuthResponse>(API.users.cartCount, {
    method: "GET",
    signal,
  });
};

export const UserUpdate = (payload: Partial<SignupPayload>, signal?: AbortSignal) => {
  return request<AuthResponse>(API.users.profile, {
    method: "PATCH",
    body: payload,
    signal,
  });
};