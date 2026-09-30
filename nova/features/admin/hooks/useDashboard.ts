import { keepPreviousData } from "@tanstack/react-query";
import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { getDashboard } from "../services/dashboard.service";
import { DashboardParams, DashboardResponse } from "../types/dashboard.types";

export function useDashboard(params?: DashboardParams) {
  return useCustomQuery<DashboardResponse>(["admin-dashboard", params], (signal) => getDashboard(params, signal), {
    placeholderData: keepPreviousData,
  });
}
