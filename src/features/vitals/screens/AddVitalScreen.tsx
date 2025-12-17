import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
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
    case 'blood_pressure':
      return 'mmHg';
    case 'blood_glucose':
      return 'mg/dL';
    case 'heart_rate':
      return 'bpm';
    case 'temperature':
      return 'C';
    case 'weight':
      return 'kg';
    case 'spo2':
      return '%';
    default:
      return '';
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
        const value: BloodPressureValue = {
          systolic: data.systolic,
          diastolic: data.diastolic,
        };
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.typeSelector}>
        <Text style={styles.label}>Vital Type</Text>
        <View style={styles.typeButtons}>
          {VITAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextActive]}>
                {VITAL_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedType === 'blood_pressure' ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Systolic (mmHg)</Text>
            <Controller
              control={control}
              name="systolic"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value?.toString()}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  keyboardType="numeric"
                  placeholder="120"
                />
              )}
            />
            {errors.systolic && <Text style={styles.error}>{errors.systolic.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Diastolic (mmHg)</Text>
            <Controller
              control={control}
              name="diastolic"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value?.toString()}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  keyboardType="numeric"
                  placeholder="80"
                />
              )}
            />
            {errors.diastolic && <Text style={styles.error}>{errors.diastolic.message}</Text>}
          </View>
        </>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>Value ({getDefaultUnit(selectedType)})</Text>
          <Controller
            control={control}
            name="value"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value?.toString()}
                onChangeText={(text) => onChange(Number(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            )}
          />
          {errors.value && <Text style={styles.error}>{errors.value.message}</Text>}
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Date & Time</Text>
        <Controller
          control={control}
          name="recordedAt"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="YYYY-MM-DDTHH:mm"
            />
          )}
        />
        {errors.recordedAt && <Text style={styles.error}>{errors.recordedAt.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes (Optional)</Text>
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

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={createVital.isPending}
      >
        {createVital.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Save Vital</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  typeSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  field: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

