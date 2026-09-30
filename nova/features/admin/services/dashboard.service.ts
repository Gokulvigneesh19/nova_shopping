import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { DashboardParams, DashboardResponse } from "@/features/admin/types/dashboard.types";

export const getDashboard = (params?: DashboardParams, signal?: AbortSignal) =>
  request<DashboardResponse>(API.admin.dashboard, {
    method: "GET",
    body: params,
    signal,
  });
