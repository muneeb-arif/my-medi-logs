import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { CreateAppointmentInput } from '../types';

export const useCreateAppointment = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentInput) => appointmentsApi.create(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list', profileId] });
    },
  });
};

