import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCreateProfile } from '../hooks/useCreateProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useProfileDetail } from '../hooks/useProfileDetail';
import type { EmergencyContact } from '../types';

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Phone is required'),
});

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  relationToAccount: z.string().min(1, 'Relation to account is required'),
  bloodType: z.string().optional(),
  heightCm: z.union([z.number(), z.string()]).optional(),
  weightKg: z.union([z.number(), z.string()]).optional(),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mode = (route.params as { mode?: string; profileId?: string })?.mode || 'create';
  const profileId = (route.params as { profileId?: string })?.profileId;
  
  const { data: existingProfile, isLoading: isLoadingProfile } = useProfileDetail(
    mode === 'edit' ? profileId || null : null
  );
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile(profileId || '');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      relationToAccount: '',
      bloodType: '',
      heightCm: '',
      weightKg: '',
      emergencyContacts: [{ name: '', relation: '', phone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  React.useEffect(() => {
    if (existingProfile && mode === 'edit') {
      reset({
        fullName: existingProfile.fullName,
        dateOfBirth: existingProfile.dateOfBirth,
        gender: existingProfile.gender,
        relationToAccount: existingProfile.relationToAccount,
        bloodType: existingProfile.bloodType || '',
        heightCm: existingProfile.heightCm || '',
        weightKg: existingProfile.weightKg || '',
        emergencyContacts:
          existingProfile.emergencyContacts.length > 0
            ? existingProfile.emergencyContacts
            : [{ name: '', relation: '', phone: '' }],
      });
    }
  }, [existingProfile, mode, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const payload = {
      ...data,
      heightCm: data.heightCm === '' ? undefined : Number(data.heightCm),
      weightKg: data.weightKg === '' ? undefined : Number(data.weightKg),
      bloodType: data.bloodType === '' ? undefined : data.bloodType,
    };

    try {
      if (mode === 'create') {
        await createProfile.mutateAsync(payload);
      } else {
        await updateProfile.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  if (isLoadingProfile && mode === 'edit') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter full name"
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
            />
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Gender *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="male, female, other"
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="relationToAccount"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Relation to Account *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="self, spouse, child, parent"
            />
            {errors.relationToAccount && (
              <Text style={styles.errorText}>{errors.relationToAccount.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="bloodType"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Blood Type</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="O+, A-, etc."
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="heightCm"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={value?.toString()}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="Height in cm"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="weightKg"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={value?.toString()}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              placeholder="Weight in kg"
            />
          </View>
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts *</Text>
        {fields.map((field, index) => (
          <View key={field.id} style={styles.emergencyContactRow}>
            <Controller
              control={control}
              name={`emergencyContacts.${index}.name`}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.emergencyField}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Name"
                  />
                </View>
              )}
            />
            <Controller
              control={control}
              name={`emergencyContacts.${index}.relation`}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.emergencyField}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Relation"
                  />
                </View>
              )}
            />
            <Controller
              control={control}
              name={`emergencyContacts.${index}.phone`}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.emergencyField}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            />
            {fields.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => remove(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {errors.emergencyContacts && (
          <Text style={styles.errorText}>{errors.emergencyContacts.message}</Text>
        )}
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => append({ name: '', relation: '', phone: '' })}
        >
          <Text style={styles.addContactButtonText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit(onSubmit)}
        disabled={createProfile.isPending || updateProfile.isPending}
      >
        {createProfile.isPending || updateProfile.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>
            {mode === 'create' ? 'Create Profile' : 'Save Changes'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emergencyContactRow: {
    marginBottom: 12,
  },
  emergencyField: {
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'red',
    fontSize: 14,
  },
  addContactButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addContactButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

