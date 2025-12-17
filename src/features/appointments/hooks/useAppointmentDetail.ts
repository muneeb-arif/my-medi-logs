import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../api/appointments.api';

export const useAppointmentDetail = (
  profileId: string | null,
  appointmentId: string | null
) => {
  return useQuery({
    queryKey: ['appointments', 'detail', profileId, appointmentId],
    queryFn: () => {
      if (!profileId || !appointmentId) {
        throw new Error('Profile ID and Appointment ID are required');
      }
      return appointmentsApi.getById(profileId, appointmentId);
    },
    enabled: !!profileId && !!appointmentId,
  });
};

