import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { PrimaryButton } from '@components/PrimaryButton';
import { spacing, typography } from '@theme';
import { useCreateAppointment } from '../hooks/useCreateAppointment';
import { useUpdateAppointment } from '../hooks/useUpdateAppointment';
import { useAppointmentDetail } from '../hooks/useAppointmentDetail';
import type { AppointmentStatus } from '../types';

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  specialty: z.string().optional(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().min(1, 'Start date and time is required'),
  endAt: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AppointmentEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const appointmentId = (route.params as { appointmentId?: string })?.appointmentId;
  const mode = (route.params as { mode?: string })?.mode || 'create';

  const createAppointment = useCreateAppointment(profileId);
  const updateAppointment = useUpdateAppointment(profileId);
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useAppointmentDetail(
    profileId,
    mode === 'edit' ? appointmentId || null : null
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      specialty: '',
      doctorName: '',
      facility: '',
      location: '',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: '',
      status: 'scheduled',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (existingAppointment && mode === 'edit') {
      reset({
        title: existingAppointment.title,
        specialty: existingAppointment.specialty || '',
        doctorName: existingAppointment.doctorName || '',
        facility: existingAppointment.facility || '',
        location: existingAppointment.location || '',
        startAt: existingAppointment.startAt.slice(0, 16),
        endAt: existingAppointment.endAt?.slice(0, 16) || '',
        status: existingAppointment.status,
        notes: existingAppointment.notes || '',
      });
    }
  }, [existingAppointment, mode, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const payload = {
        title: data.title,
        specialty: data.specialty || undefined,
        doctorName: data.doctorName || undefined,
        facility: data.facility || undefined,
        location: data.location || undefined,
        startAt: new Date(data.startAt).toISOString(),
        endAt: data.endAt ? new Date(data.endAt).toISOString() : undefined,
        status: data.status,
        notes: data.notes || undefined,
      };

      if (mode === 'create') {
        await createAppointment.mutateAsync(payload);
      } else {
        await updateAppointment.mutateAsync({ appointmentId: appointmentId!, data: payload });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save appointment');
    }
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending || isLoadingAppointment;

  if (isLoadingAppointment) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable padding="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Appointment Details */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.title && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Appointment title"
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Start Date & Time *</Text>
              <Controller
                control={control}
                name="startAt"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.startAt && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DDTHH:mm"
                    />
                    {errors.startAt && <Text style={styles.errorText}>{errors.startAt.message}</Text>}
                    <Text style={styles.helperText}>Format: YYYY-MM-DDTHH:mm (e.g., 2025-07-26T10:00)</Text>
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>End Date & Time</Text>
              <Controller
                control={control}
                name="endAt"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DDTHH:mm"
                    />
                    <Text style={styles.helperText}>Format: YYYY-MM-DDTHH:mm</Text>
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.statusContainer}>
                {STATUS_OPTIONS.map((option) => (
                  <Controller
                    key={option.value}
                    control={control}
                    name="status"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={[styles.statusButton, value === option.value && styles.statusButtonActive]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={[styles.statusText, value === option.value && styles.statusTextActive]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>
              {errors.status && <Text style={styles.errorText}>{errors.status.message}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Doctor Name</Text>
              <Controller
                control={control}
                name="doctorName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Specialty</Text>
              <Controller
                control={control}
                name="specialty"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Facility</Text>
              <Controller
                control={control}
                name="facility"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Optional"
                  />
                )}
              />
            </View>
          </SectionCard>

          {/* Optional Notes */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Notes</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value || ''}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    placeholder="Additional notes..."
                  />
                )}
              />
            </View>
          </SectionCard>

          <PrimaryButton
            label={mode === 'create' ? 'Create Appointment' : 'Update Appointment'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
