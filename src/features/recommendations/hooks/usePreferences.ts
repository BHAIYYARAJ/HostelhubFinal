import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { preferencesRepo } from "../repositories/preferencesRepo";
import type { StudentPreference } from "../types";

export function usePreferences() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["aphr", "preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const existing = await preferencesRepo.get(user.id);
      return existing ?? preferencesRepo.buildDefault(user.id);
    },
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: async (pref: StudentPreference) => preferencesRepo.upsert(pref),
    onSuccess: (data) => {
      qc.setQueryData(["aphr", "preferences", user?.id], data);
      qc.invalidateQueries({ queryKey: ["aphr", "recommendations", user?.id] });
    },
  });

  return { ...query, save };
}