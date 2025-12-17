import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMedicationsList } from '@features/medications/hooks/useMedicationsList';
import { useProfileDetail } from '@features/profiles/hooks/useProfileDetail';
import { useReportsList } from '@features/reports/hooks/useReportsList';
import { useVitalsList } from '@features/vitals/hooks/useVitalsList';
import type { Medication } from '@features/medications/types';
import type { Report } from '@features/reports/types';
import type { VitalEntry } from '@features/vitals/types';

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatVitalValue = (entry: VitalEntry): string => {
  if (entry.type === 'blood_pressure' && typeof entry.value === 'object') {
    return `${entry.value.systolic}/${entry.value.diastolic} ${entry.unit}`;
  }
  return `${entry.value} ${entry.unit}`;
};

const VITAL_TYPE_LABELS: Record<string, string> = {
  blood_pressure: 'BP',
  blood_glucose: 'Glucose',
  heart_rate: 'HR',
  temperature: 'Temp',
  weight: 'Weight',
  spo2: 'SpO2',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();

  const { data: profile, isLoading: isLoadingProfile } = useProfileDetail(activeProfileId);
  const { data: reportsData, isLoading: isLoadingReports } = useReportsList(activeProfileId, {
    limit: 3,
  });
  const { data: vitalsData, isLoading: isLoadingVitals } = useVitalsList(activeProfileId, {
    limit: 3,
  });
  const { data: medicationsData, isLoading: isLoadingMeds } = useMedicationsList(
    activeProfileId,
    { status: 'ongoing', limit: 50 }
  );

  const recentReports = useMemo(() => {
    if (!reportsData?.items) return [];
    return [...reportsData.items]
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
      .slice(0, 3);
  }, [reportsData]);

  const recentVitals = useMemo(() => {
    if (!vitalsData?.items) return [];
    return [...vitalsData.items]
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 3);
  }, [vitalsData]);

  const ongoingMedications = useMemo(() => {
    if (!medicationsData?.items) return [];
    return medicationsData.items.filter((m) => m.status === 'ongoing');
  }, [medicationsData]);

  const isLoading =
    isLoadingProfile || isLoadingReports || isLoadingVitals || isLoadingMeds;

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{profile.fullName}</Text>
          <View style={styles.profileDetails}>
            <Text style={styles.profileDetail}>
              Age: {calculateAge(profile.dateOfBirth)}
            </Text>
            {profile.relationToAccount && (
              <Text style={styles.profileDetail}>{profile.relationToAccount}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Reports' as never)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentReports.length === 0 ? (
          <Text style={styles.emptySectionText}>No reports yet</Text>
        ) : (
          recentReports.map((report: Report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.itemCard}
              onPress={() =>
                navigation.navigate('ReportViewer' as never, {
                  profileId: activeProfileId,
                  reportId: report.id,
                } as never)
              }
            >
              <Text style={styles.itemTitle}>{report.title}</Text>
              <Text style={styles.itemSubtitle}>
                {report.type} • {new Date(report.reportDate).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Vitals</Text>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('Vitals' as never)}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentVitals.length === 0 ? (
          <Text style={styles.emptySectionText}>No vitals recorded yet</Text>
        ) : (
          recentVitals.map((vital: VitalEntry) => (
            <TouchableOpacity
              key={vital.id}
              style={styles.itemCard}
              onPress={() => navigation.getParent()?.navigate('Vitals' as never)}
            >
              <Text style={styles.itemTitle}>
                {VITAL_TYPE_LABELS[vital.type] || vital.type}
              </Text>
              <Text style={styles.itemSubtitle}>
                {formatVitalValue(vital)} •{' '}
                {new Date(vital.recordedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity
            onPress={() => {
              // Navigate to Medications at the AppNavigator level
              // MainTabsNavigator's parent is AppNavigator, which contains Medications route
              const appNavigator = navigation.getParent();
              if (appNavigator) {
                appNavigator.navigate('Medications' as never);
              }
            }}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        {ongoingMedications.length === 0 ? (
          <Text style={styles.emptySectionText}>No ongoing medications</Text>
        ) : (
          <>
            <Text style={styles.medicationCount}>
              {ongoingMedications.length} ongoing medication
              {ongoingMedications.length !== 1 ? 's' : ''}
            </Text>
            {ongoingMedications.slice(0, 2).map((med: Medication) => (
              <View key={med.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{med.name}</Text>
                {med.dose && med.doseUnit && (
                  <Text style={styles.itemSubtitle}>
                    {med.dose} {med.doseUnit} • {med.frequency.replace('_', ' ')}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  profileDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  profileDetail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  medicationCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
});
