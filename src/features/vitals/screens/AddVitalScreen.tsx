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
import { useCreateVital } from '../hooks/useCreateVital';
import type { BloodPressureValue, VitalType } from '../types';

const VITAL_TYPES: VitalType[] = [
  'blood_pressure',
  'blood_glucose',
  'heart_rate',
  'temperature',
  'weight',
  'spo2',
];

const VITAL_TYPE_LABELS: Record<VitalType, string> = {
  blood_pressure: 'Blood Pressure',
  blood_glucose: 'Blood Glucose',
  heart_rate: 'Heart Rate',
  temperature: 'Temperature',
  weight: 'Weight',
  spo2: 'SpO2',
};

const createVitalSchema = (type: VitalType) => {
  if (type === 'blood_pressure') {
    return z.object({
      type: z.literal('blood_pressure'),
      systolic: z.number().min(50).max(250),
      diastolic: z.number().min(30).max(150),
      unit: z.literal('mmHg'),
      recordedAt: z.string().min(1, 'Date and time is required'),
      notes: z.string().optional(),
    });
  }
  return z.object({
    type: z.enum(['blood_glucose', 'heart_rate', 'temperature', 'weight', 'spo2']),
    value: z.number().min(0),
    unit: z.string(),
    recordedAt: z.string().min(1, 'Date and time is required'),
    notes: z.string().optional(),
  });
};

type VitalFormData = z.infer<ReturnType<typeof createVitalSchema>>;

const getDefaultUnit = (type: VitalType): string => {
  switch (type) {
    case 'blood_pressure': return 'mmHg';
    case 'blood_glucose': return 'mg/dL';
    case 'heart_rate': return 'bpm';
    case 'temperature': return 'C';
    case 'weight': return 'kg';
    case 'spo2': return '%';
    default: return '';
  }
};

export const AddVitalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const createVital = useCreateVital(profileId);
  const [selectedType, setSelectedType] = React.useState<VitalType>('blood_pressure');
  const schema = React.useMemo(() => createVitalSchema(selectedType), [selectedType]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VitalFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'blood_pressure',
      systolic: 120,
      diastolic: 80,
      unit: 'mmHg',
      recordedAt: new Date().toISOString().slice(0, 16),
      notes: '',
    },
  });

  React.useEffect(() => {
    const defaultUnit = getDefaultUnit(selectedType);
    if (selectedType === 'blood_pressure') {
      reset({
        type: 'blood_pressure',
        systolic: 120,
        diastolic: 80,
        unit: defaultUnit,
        recordedAt: new Date().toISOString().slice(0, 16),
        notes: '',
      });
    } else {
      reset({
        type: selectedType,
        value: 0,
        unit: defaultUnit,
        recordedAt: new Date().toISOString().slice(0, 16),
        notes: '',
      });
    }
  }, [selectedType, reset]);

  const onSubmit = async (data: VitalFormData) => {
    try {
      let payload;
      if (selectedType === 'blood_pressure') {
        const value: BloodPressureValue = { systolic: data.systolic, diastolic: data.diastolic };
        payload = {
          type: 'blood_pressure',
          value,
          unit: data.unit,
          recordedAt: new Date(data.recordedAt).toISOString(),
          notes: data.notes || undefined,
        };
      } else {
        payload = {
          type: selectedType,
          value: data.value,
          unit: data.unit,
          recordedAt: new Date(data.recordedAt).toISOString(),
          notes: data.notes || undefined,
        };
      }
      await createVital.mutateAsync(payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save vital reading');
    }
  };

  return (
    <Screen scrollable padding="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Vital Type</Text>
            <View style={styles.typeButtons}>
              {VITAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>
                    {VITAL_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Reading</Text>
            {selectedType === 'blood_pressure' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Systolic (mmHg) *</Text>
                  <Controller
                    control={control}
                    name="systolic"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={[styles.input, errors.systolic && styles.inputError]}
                          value={value?.toString()}
                          onChangeText={(text) => onChange(Number(text) || 0)}
                          keyboardType="numeric"
                          placeholder="120"
                        />
                        {errors.systolic && <Text style={styles.errorText}>{errors.systolic.message}</Text>}
                      </>
                    )}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Diastolic (mmHg) *</Text>
                  <Controller
                    control={control}
                    name="diastolic"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          style={[styles.input, errors.diastolic && styles.inputError]}
                          value={value?.toString()}
                          onChangeText={(text) => onChange(Number(text) || 0)}
                          keyboardType="numeric"
                          placeholder="80"
                        />
                        {errors.diastolic && <Text style={styles.errorText}>{errors.diastolic.message}</Text>}
                      </>
                    )}
                  />
                </View>
              </>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>Value ({getDefaultUnit(selectedType)}) *</Text>
                <Controller
                  control={control}
                  name="value"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <TextInput
                        style={[styles.input, errors.value && styles.inputError]}
                        value={value?.toString()}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      {errors.value && <Text style={styles.errorText}>{errors.value.message}</Text>}
                    </>
                  )}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Date & Time *</Text>
              <Controller
                control={control}
                name="recordedAt"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.recordedAt && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DDTHH:mm"
                    />
                    {errors.recordedAt && <Text style={styles.errorText}>{errors.recordedAt.message}</Text>}
                    <Text style={styles.helperText}>Format: YYYY-MM-DDTHH:mm (e.g., 2025-07-26T10:00)</Text>
                  </>
                )}
              />
            </View>
          </SectionCard>

          <SectionCard style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Additional Notes (Optional)</Text>
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
                    placeholder="Any additional notes..."
                  />
                )}
              />
            </View>
          </SectionCard>

          <PrimaryButton
            label="Save Vital"
            onPress={handleSubmit(onSubmit)}
            loading={createVital.isPending}
            disabled={createVital.isPending}
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
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  typeTextActive: {
    color: '#FFFFFF',
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
  errorText: {
    ...typography.caption,
    color: '#FF3B30',
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: '#8E8E93',
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
