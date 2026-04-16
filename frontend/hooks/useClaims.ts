'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ClaimRequest } from '@/types/item';

export const useMyClaims = () =>
  useQuery<ClaimRequest[]>({
    queryKey: ['claims', 'me'],
    queryFn:  async () => {
      const { data } = await api.get('/claims/me');
      return data.data;
    },
  });

export const useClaimsForItem = (itemId: string) =>
  useQuery<ClaimRequest[]>({
    queryKey: ['claims', 'item', itemId],
    queryFn:  async () => {
      const { data } = await api.get(`/claims/item/${itemId}`);
      return data.data;
    },
    enabled: !!itemId,
  });

export const useCreateClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/claims', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useApproveClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => api.put(`/claims/${claimId}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useRejectClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (claimId: string) => api.put(`/claims/${claimId}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  });
};
