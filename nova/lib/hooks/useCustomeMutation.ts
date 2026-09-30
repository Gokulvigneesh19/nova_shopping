"use client";

import {
  useMutation,
  useQueryClient,
  type MutationKey,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useToastStore } from "../globalstore/toast.store";

interface CustomMutationOptions<
  TData,
  TVariables,
  TError = Error,
  TContext = unknown,
> extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  > {
  mutationKey?: MutationKey;

  invalidateQueries?: QueryKey[];

  setQueryData?: {
    queryKey: QueryKey;
    updater: TData | ((oldData: unknown) => unknown);
  };

  successMessage?: string;
  errorMessage?: string;
}

export function useCustomMutation<
  TData,
  TVariables,
  TError = Error,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  {
    mutationKey,
    invalidateQueries,
    setQueryData,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    ...mutationOptions
  }: CustomMutationOptions<
    TData,
    TVariables,
    TError,
    TContext
  > = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  const toast = useToastStore();

  return useMutation({
    mutationKey,

    mutationFn,

    retry: 1,

    ...mutationOptions,

    onSuccess: async (
      data,
      variables,
      onMutateResult,
      context
    ) => {
      // Update cache directly
      if (setQueryData) {
        queryClient.setQueryData(
          setQueryData.queryKey,
          setQueryData.updater
        );
      }

      // Invalidate queries
      if (invalidateQueries?.length) {
        await Promise.all(
          invalidateQueries.map((queryKey) =>
            queryClient.invalidateQueries({
              queryKey,
            })
          )
        );
      }

      if (successMessage) {
        toast.triggerToast(successMessage, "success", "top-right");
      }

      await onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      toast.triggerToast(
        errorMessage ?? (error as Error).message,
        "error",
        "top-right"
      );

      onError?.(error, variables, onMutateResult, context);
    },
  });
}