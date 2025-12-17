import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDeleteVital } from '../hooks/useDeleteVital';
import { useVitalsList } from '../hooks/useVitalsList';
import type { VitalEntry, VitalType } from '../types';

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

const formatVitalValue = (entry: VitalEntry): string => {
  if (entry.type === 'blood_pressure' && typeof entry.value === 'object') {
    return `${entry.value.systolic}/${entry.value.diastolic} ${entry.unit}`;
  }
  return `${entry.value} ${entry.unit}`;
};

const calculateTrend = (entries: VitalEntry[]): { last: VitalEntry | null; change: string | null } => {
  if (entries.length === 0) return { last: null, change: null };
  if (entries.length === 1) return { last: entries[0], change: null };

  const [last, previous] = entries;
  let change: string | null = null;

  if (last.type === 'blood_pressure' && previous.type === 'blood_pressure') {
    const lastAvg = (typeof last.value === 'object' ? (last.value.systolic + last.value.diastolic) / 2 : last.value as number);
    const prevAvg = (typeof previous.value === 'object' ? (previous.value.systolic + previous.value.diastolic) / 2 : previous.value as number);
    const diff = lastAvg - prevAvg;
    change = diff > 0 ? `↑ +${diff.toFixed(1)}` : diff < 0 ? `↓ ${diff.toFixed(1)}` : '→';
  } else if (typeof last.value === 'number' && typeof previous.value === 'number') {
    const diff = last.value - previous.value;
    change = diff > 0 ? `↑ +${diff.toFixed(1)}` : diff < 0 ? `↓ ${diff.toFixed(1)}` : '→';
  }

  return { last, change };
};

export const VitalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();
  const [selectedType, setSelectedType] = useState<VitalType | undefined>();
  const { data, isLoading, error } = useVitalsList(activeProfileId, { type: selectedType });
  const deleteVital = useDeleteVital(activeProfileId || '');

  const sortedEntries = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => {
      const dateA = new Date(a.recordedAt).getTime();
      const dateB = new Date(b.recordedAt).getTime();
      return dateB - dateA;
    });
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (!selectedType) return sortedEntries;
    return sortedEntries.filter((e) => e.type === selectedType);
  }, [sortedEntries, selectedType]);

  const trend = useMemo(() => {
    return calculateTrend(filteredEntries);
  }, [filteredEntries]);

  const handleDelete = (entry: VitalEntry) => {
    Alert.alert(
      'Delete Vital',
      `Are you sure you want to delete this ${VITAL_TYPE_LABELS[entry.type]} reading?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVital.mutate(entry.id),
        },
      ]
    );
  };

  if (!activeProfileId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active profile selected</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Profiles' as never)}
        >
          <Text style={styles.buttonText}>Go to Profiles</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load vitals</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {trend.last && (
        <View style={styles.trendContainer}>
          <Text style={styles.trendLabel}>Last Reading</Text>
          <Text style={styles.trendValue}>{formatVitalValue(trend.last)}</Text>
          {trend.change && <Text style={styles.trendChange}>{trend.change}</Text>}
          <Text style={styles.trendDate}>
            {new Date(trend.last.recordedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedType && styles.filterButtonActive]}
            onPress={() => setSelectedType(undefined)}
          >
            <Text style={[styles.filterText, !selectedType && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {VITAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
                {VITAL_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vitals recorded yet</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AddVital' as never, { profileId: activeProfileId })}
          >
            <Text style={styles.buttonText}>Add Vital</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.entryItem}
                onLongPress={() => handleDelete(item)}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryType}>{VITAL_TYPE_LABELS[item.type]}</Text>
                  <Text style={styles.entryValue}>{formatVitalValue(item)}</Text>
                </View>
                <Text style={styles.entryDate}>
                  {new Date(item.recordedAt).toLocaleString()}
                </Text>
                {item.notes && <Text style={styles.entryNotes}>{item.notes}</Text>}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddVital' as never, { profileId: activeProfileId })}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  trendChange: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  trendDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  filterContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
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
  entryItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  entryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  entryDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
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

