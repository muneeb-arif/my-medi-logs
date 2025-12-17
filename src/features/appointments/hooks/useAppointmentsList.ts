import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';
import type { AppointmentsListParams } from '../types';

export const useAppointmentsList = (
  profileId: string | null,
  params?: AppointmentsListParams
) => {
  return useQuery({
    queryKey: ['appointments', 'list', profileId, params],
    queryFn: () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return appointmentsApi.list(profileId, params);
    },
    enabled: !!profileId,
  });
};

