"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

interface CustomQueryOptions<TData, TError = Error>
  extends Omit<
    UseQueryOptions<TData, TError>,
    "queryKey" | "queryFn"
  > {}

export function useCustomQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: (signal?: AbortSignal) => Promise<TData>,
  options?: CustomQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,

    queryFn: ({ signal }) => queryFn(signal),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    retry: 1,

    refetchOnWindowFocus: false,

    ...options,
  });
}