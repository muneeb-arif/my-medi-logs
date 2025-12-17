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
import { useCreateMedication } from '../hooks/useCreateMedication';
import { useUpdateMedication } from '../hooks/useUpdateMedication';
import { useMedicationDetail } from '../hooks/useMedicationDetail';
import type { MedicationFrequency, MedicationStatus } from '../types';

const medicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genericName: z.string().optional(),
  dose: z.union([z.number(), z.string()]).optional(),
  doseUnit: z.string().optional(),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed', 'custom']),
  schedule: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ongoing', 'stopped']),
  notes: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

const FREQUENCY_OPTIONS: { value: MedicationFrequency; label: string }[] = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'custom', label: 'Custom' },
];

export const MedicationEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const medicationId = (route.params as { medicationId?: string })?.medicationId;
  const mode = (route.params as { mode?: string })?.mode || 'create';

  const createMedication = useCreateMedication(profileId);
  const updateMedication = useUpdateMedication(profileId);
  const { data: existingMedication, isLoading: isLoadingMedication } = useMedicationDetail(
    profileId,
    mode === 'edit' ? medicationId || null : null
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      genericName: '',
      dose: '',
      doseUnit: '',
      frequency: 'once_daily',
      schedule: '',
      startDate: '',
      endDate: '',
      status: 'ongoing',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (existingMedication && mode === 'edit') {
      reset({
        name: existingMedication.name,
        genericName: existingMedication.genericName || '',
        dose: existingMedication.dose?.toString() || '',
        doseUnit: existingMedication.doseUnit || '',
        frequency: existingMedication.frequency,
        schedule: existingMedication.schedule || '',
        startDate: existingMedication.startDate || '',
        endDate: existingMedication.endDate || '',
        status: existingMedication.status,
        notes: existingMedication.notes || '',
      });
    }
  }, [existingMedication, mode, reset]);

  const selectedFrequency = watch('frequency');

  const onSubmit = async (data: MedicationFormData) => {
    try {
      const payload = {
        name: data.name,
        genericName: data.genericName || undefined,
        dose: data.dose ? Number(data.dose) : undefined,
        doseUnit: data.doseUnit || undefined,
        frequency: data.frequency,
        schedule: data.schedule || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        status: data.status,
        notes: data.notes || undefined,
      };

      if (mode === 'create') {
        await createMedication.mutateAsync(payload);
      } else {
        await updateMedication.mutateAsync({ medicationId: medicationId!, data: payload });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save medication');
    }
  };

  const isLoading = createMedication.isPending || updateMedication.isPending || isLoadingMedication;

  if (isLoadingMedication) {
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
          {/* Medication Details */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Medication Details</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Medication name"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                  </>
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Generic Name</Text>
              <Controller
                control={control}
                name="genericName"
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

            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Dose</Text>
                <Controller
                  control={control}
                  name="dose"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value?.toString() || ''}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      placeholder="500"
                    />
                  )}
                />
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Unit</Text>
                <Controller
                  control={control}
                  name="doseUnit"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="mg"
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.statusContainer}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TouchableOpacity
                        style={[styles.statusButton, value === 'ongoing' && styles.statusButtonActive]}
                        onPress={() => onChange('ongoing')}
                      >
                        <Text
                          style={[styles.statusText, value === 'ongoing' && styles.statusTextActive]}
                        >
                          Ongoing
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusButton, value === 'stopped' && styles.statusButtonActive]}
                        onPress={() => onChange('stopped')}
                      >
                        <Text
                          style={[styles.statusText, value === 'stopped' && styles.statusTextActive]}
                        >
                          Stopped
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                />
              </View>
              {errors.status && <Text style={styles.errorText}>{errors.status.message}</Text>}
            </View>
          </SectionCard>

          {/* Schedule */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Frequency *</Text>
              <View style={styles.frequencyContainer}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <Controller
                    key={option.value}
                    control={control}
                    name="frequency"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={[
                          styles.frequencyButton,
                          value === option.value && styles.frequencyButtonActive,
                        ]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={[
                            styles.frequencyText,
                            value === option.value && styles.frequencyTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                ))}
              </View>
              {errors.frequency && <Text style={styles.errorText}>{errors.frequency.message}</Text>}
            </View>

            {(selectedFrequency === 'custom' || selectedFrequency !== 'custom') && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  {selectedFrequency === 'custom' ? 'Schedule *' : 'Schedule'}
                </Text>
                <Controller
                  control={control}
                  name="schedule"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="e.g., Morning and night"
                    />
                  )}
                />
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Start Date</Text>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                    />
                  )}
                />
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>End Date</Text>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                    />
                  )}
                />
              </View>
            </View>
          </SectionCard>

          {/* Notes */}
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Additional Notes</Text>
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
            label={mode === 'create' ? 'Create Medication' : 'Update Medication'}
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
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
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  frequencyText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  frequencyTextActive: {
    color: '#FFFFFF',
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
