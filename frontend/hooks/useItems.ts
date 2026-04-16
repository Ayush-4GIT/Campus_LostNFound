'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ItemFilters, LostFoundItem, PaginatedItems } from '@/types/item';

export const useItems = (filters: ItemFilters = {}) =>
  useQuery<PaginatedItems>({
    queryKey: ['items', filters],
    queryFn:  async () => {
      const { data } = await api.get('/items', { params: filters });
      return data.data;
    },
  });

export const useMyItems = () =>
  useQuery<LostFoundItem[]>({
    queryKey: ['items', 'my'],
    queryFn:  async () => {
      const { data } = await api.get('/items/my');
      return data.data;
    },
  });

export const useItem = (id: string) =>
  useQuery<LostFoundItem>({
    queryKey: ['items', id],
    queryFn:  async () => {
      const { data } = await api.get(`/items/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
};

export const useUpdateItem = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['items', id] });
    },
  });
};

export const useDeleteItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
};
