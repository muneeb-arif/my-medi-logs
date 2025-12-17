import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
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
import { useCreateReport } from '../hooks/useCreateReport';
import type { ReportType } from '../types';

const reportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  reportDate: z.string().min(1, 'Report date is required'),
  type: z.enum(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other']),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  tags: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export const AddReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const profileId = (route.params as { profileId: string })?.profileId;
  const createReport = useCreateReport(profileId);

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      reportDate: '',
      type: 'lab',
      doctorName: '',
      facility: '',
      tags: '',
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name || 'report',
          mimeType: asset.mimeType || 'application/pdf',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.mimeType)) {
      Alert.alert('Error', 'Only PDF, JPEG, and PNG files are allowed');
      return;
    }

    try {
      const tags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined;

      await createReport.mutateAsync({
        input: {
          title: data.title,
          reportDate: data.reportDate,
          type: data.type as ReportType,
          doctorName: data.doctorName || undefined,
          facility: data.facility || undefined,
          tags,
        },
        fileUri: selectedFile.uri,
        fileType: selectedFile.mimeType,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload report. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter report title"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="reportDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Report Date *</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
            />
            {errors.reportDate && <Text style={styles.errorText}>{errors.reportDate.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Type *</Text>
            <View style={styles.typeContainer}>
              {(['lab', 'radiology', 'prescription', 'visit_note', 'discharge', 'other'] as const).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, value === type && styles.typeButtonActive]}
                    onPress={() => onChange(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        value === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
            {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="doctorName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Doctor Name</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Optional"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="facility"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Facility</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Optional"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Comma-separated tags (optional)"
            />
          </View>
        )}
      />

      <View style={styles.field}>
        <Text style={styles.label}>File *</Text>
        <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
          <Text style={styles.fileButtonText}>
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Select PDF, JPEG, or PNG'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={createReport.isPending || !selectedFile}
      >
        {createReport.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Upload Report</Text>
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#333',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  fileButtonText: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

