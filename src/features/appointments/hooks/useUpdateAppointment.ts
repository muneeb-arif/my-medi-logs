import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { UpdateAppointmentInput } from '../types';

export const useUpdateAppointment = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: UpdateAppointmentInput;
    }) => appointmentsApi.update(profileId, appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', 'list', profileId] });
    },
  });
};

