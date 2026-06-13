import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/store";

const TX_KEY = ["transactions"];

export function useTransactions() {
  const { transactions: fallback } = useStore();
  return useQuery({
    queryKey: TX_KEY,
    queryFn: api.billing.transactions,
    select: (data) => (data && data.length > 0 ? data : fallback),
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.billing.purchase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TX_KEY }),
  });
}
