import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/store";

const RULES_KEY = ["rules"];

export function useRules() {
  const { rules: fallback } = useStore();
  return useQuery({
    queryKey: RULES_KEY,
    queryFn: api.rules.list,
    select: (data) => (data && data.length > 0 ? data : fallback),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.rules.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RULES_KEY }),
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.rules.toggle(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RULES_KEY }),
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.rules.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RULES_KEY }),
  });
}
