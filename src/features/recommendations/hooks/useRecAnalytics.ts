import { useQuery } from "@tanstack/react-query";
import { loadAdminAnalytics } from "../services/analyticsService";

export function useRecAnalytics() {
  return useQuery({
    queryKey: ["aphr", "analytics"],
    queryFn: loadAdminAnalytics,
  });
}