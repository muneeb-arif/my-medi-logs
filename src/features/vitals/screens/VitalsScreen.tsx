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
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { EmptyState } from '@components/EmptyState';
import { PrimaryButton } from '@components/PrimaryButton';
import { spacing, typography, radius } from '@theme';
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
      <Screen>
        <EmptyState
          title="No active profile selected"
          description="Select or create a profile to track vitals"
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
          <Text style={styles.errorText}>Failed to load vitals</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {trend.last && (
        <SectionCard style={styles.trendCard}>
          <Text style={styles.trendLabel}>Last Reading</Text>
          <Text style={styles.trendValue}>{formatVitalValue(trend.last)}</Text>
          {trend.change && <Text style={styles.trendChange}>{trend.change}</Text>}
          <Text style={styles.trendDate}>
            {new Date(trend.last.recordedAt).toLocaleDateString()}
          </Text>
        </SectionCard>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
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
        <EmptyState
          icon="📊"
          title="No vitals recorded yet"
          description="Track readings over time to spot trends."
          actionLabel="Add Vital"
          onAction={() => navigation.navigate('AddVital' as never, { profileId: activeProfileId })}
        />
      ) : (
        <>
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SectionCard style={styles.entryCard}>
                <TouchableOpacity
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
              </SectionCard>
            )}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.fabContainer}>
            <PrimaryButton
              label="+ Add Vital"
              onPress={() => navigation.navigate('AddVital' as never, { profileId: activeProfileId })}
              style={styles.fab}
            />
          </View>
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
  trendCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  trendLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  trendValue: {
    ...typography.h1,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  trendChange: {
    ...typography.body,
    color: '#007AFF',
    marginBottom: spacing.xs,
  },
  trendDate: {
    ...typography.caption,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginBottom: spacing.sm,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    ...typography.body,
    fontSize: 14,
    color: '#000000',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
  },
  entryCard: {
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryType: {
    ...typography.bodyBold,
  },
  entryValue: {
    ...typography.h2,
    fontSize: 18,
    color: '#007AFF',
  },
  entryDate: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  entryNotes: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
  },
  fabContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  fab: {
    width: '100%',
  },
});
