import { API_BASE_URL } from "./client";
import { auth } from "../auth";
import useAuthStore from "../globalstore/auth.store";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rawError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** Send the browser to the 404 page when a GET returns 404. Defaults to true. */
  redirectOnNotFound?: boolean;
}

export async function request<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    redirectOnNotFound = true,
  } = options;
  const isFormData = body instanceof FormData;

  const finalHeaders = new Headers(headers);

  if (!isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const accessToken = auth.getAccessToken();

  if (accessToken && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let url = API_BASE_URL + endpoint;

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
    signal,
    credentials: "include",
  };

  if (method === "GET" && body && typeof body === "object") {
    const params = new URLSearchParams();

    Object.entries(body as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (value != null) {
          params.append(key, String(value));
        }
      }
    );

    url += `?${params.toString()}`;
  } else if (body !== undefined) {
    fetchOptions.body = isFormData
      ? body as FormData
      : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  const contentType = response.headers.get("content-type");
  const responseData = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    if(response?.status === 401) {
      useAuthStore.getState().logout();
    }
    // Only GETs: a 404 from a mutation (e.g. deleting a stale cart item) shouldn't navigate away.
    if (
      response.status === 404 &&
      method === "GET" &&
      redirectOnNotFound &&
      typeof window !== "undefined"
    ) {
      window.location.replace("/not-found");
    }
    throw new ApiError(
      responseData?.message ??
        response.statusText ??
        "Something went wrong",
      response.status,
      responseData
    );
  }

  return responseData as TResponse;
}