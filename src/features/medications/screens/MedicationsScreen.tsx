import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Screen } from '@components/Screen';
import { EmptyState } from '@components/EmptyState';
import { spacing, typography } from '@theme';
import { useDeleteMedication } from '../hooks/useDeleteMedication';
import { useMedicationsList } from '../hooks/useMedicationsList';
import type { Medication, MedicationStatus } from '../types';

const formatMedicationDose = (med: Medication): string => {
  if (med.dose && med.doseUnit) {
    return `${med.dose} ${med.doseUnit}`;
  }
  return '';
};

const formatFrequency = (frequency: string): string => {
  const labels: Record<string, string> = {
    once_daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_times_daily: 'Three times daily',
    weekly: 'Weekly',
    as_needed: 'As needed',
    custom: 'Custom',
  };
  return labels[frequency] || frequency;
};

export const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();
  const [selectedStatus, setSelectedStatus] = useState<MedicationStatus | undefined>('ongoing');
  const { data, isLoading, error } = useMedicationsList(activeProfileId, {
    status: selectedStatus,
  });
  const deleteMedication = useDeleteMedication(activeProfileId || '');

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medication.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMedication.mutate(medication.id),
        },
      ]
    );
  };

  const handleSelectMedication = (medication: Medication) => {
    navigation.navigate('MedicationEditor' as never, {
      profileId: activeProfileId,
      medicationId: medication.id,
      mode: 'edit',
    } as never);
  };

  if (!activeProfileId) {
    return (
      <Screen>
        <EmptyState
          title="No active profile selected"
          description="Select or create a profile to manage medications"
          actionLabel="Go to Profiles"
          onAction={() => navigation.navigate('Profiles' as never)}
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load medications</Text>
        </View>
      </Screen>
    );
  }

  const medications = data?.items || [];

  return (
    <Screen>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === 'ongoing' && styles.filterButtonActive]}
          onPress={() => setSelectedStatus('ongoing')}
        >
          <Text
            style={[styles.filterText, selectedStatus === 'ongoing' && styles.filterTextActive]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedStatus === 'stopped' && styles.filterButtonActive]}
          onPress={() => setSelectedStatus('stopped')}
        >
          <Text
            style={[styles.filterText, selectedStatus === 'stopped' && styles.filterTextActive]}
          >
            Stopped
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !selectedStatus && styles.filterButtonActive]}
          onPress={() => setSelectedStatus(undefined)}
        >
          <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {medications.length === 0 ? (
        <EmptyState
          icon="💊"
          title="No medications yet"
          description="Keep a list of ongoing meds for doctor visits."
          actionLabel="Add Medication"
          onAction={() =>
            navigation.navigate('MedicationEditor' as never, {
              profileId: activeProfileId,
              mode: 'create',
            } as never)
          }
        />
      ) : (
        <>
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.medicationItem}
                onPress={() => handleSelectMedication(item)}
                onLongPress={() => handleDelete(item)}
              >
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{item.name}</Text>
                  <Text style={styles.medicationStatus}>{item.status}</Text>
                </View>
                {item.genericName && (
                  <Text style={styles.medicationGeneric}>{item.genericName}</Text>
                )}
                <View style={styles.medicationDetails}>
                  {formatMedicationDose(item) && (
                    <Text style={styles.medicationDetail}>{formatMedicationDose(item)}</Text>
                  )}
                  <Text style={styles.medicationDetail}>{formatFrequency(item.frequency)}</Text>
                </View>
                {item.schedule && (
                  <Text style={styles.medicationSchedule}>{item.schedule}</Text>
                )}
                {item.startDate && (
                  <Text style={styles.medicationDate}>
                    Started: {new Date(item.startDate).toLocaleDateString()}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() =>
              navigation.navigate('MedicationEditor' as never, {
                profileId: activeProfileId,
                mode: 'create',
              } as never)
            }
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  medicationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  medicationStatus: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  medicationGeneric: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  medicationDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  medicationDetail: {
    fontSize: 14,
    color: '#000000',
  },
  medicationSchedule: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  medicationDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

