import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '@components/Screen';
import { SectionCard } from '@components/SectionCard';
import { EmptyState } from '@components/EmptyState';
import { PrimaryButton } from '@components/PrimaryButton';
import { spacing, typography } from '@theme';
import { useDeleteReport } from '../hooks/useDeleteReport';
import { useReportsList } from '../hooks/useReportsList';
import type { Report } from '../types';

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeProfileId } = useActiveProfileStore();
  const { data, isLoading, error } = useReportsList(activeProfileId);
  const deleteReport = useDeleteReport(activeProfileId || '');

  const sortedReports = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => {
      const dateA = new Date(a.reportDate).getTime();
      const dateB = new Date(b.reportDate).getTime();
      return dateB - dateA;
    });
  }, [data]);

  const handleDelete = (report: Report) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${report.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReport.mutate(report.id),
        },
      ]
    );
  };

  const handleSelectReport = (report: Report) => {
    navigation.navigate('ReportViewer' as never, {
      profileId: activeProfileId,
      reportId: report.id,
    } as never);
  };

  if (!activeProfileId) {
    return (
      <Screen>
        <EmptyState
          title="No active profile selected"
          actionLabel="Select or Create Profile"
          onAction={() => navigation.getParent()?.navigate('Profiles' as never)}
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
          <Text style={styles.errorText}>Failed to load reports</Text>
        </View>
      </Screen>
    );
  }

  const renderReportItem = ({ item }: { item: Report }) => (
    <SectionCard style={styles.reportItem}>
      <TouchableOpacity
        style={styles.reportContent}
        onPress={() => handleSelectReport(item)}
      >
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <Text style={styles.reportDate}>{item.reportDate}</Text>
          <Text style={styles.reportType}>{item.type}</Text>
          {item.doctorName && <Text style={styles.reportDoctor}>{item.doctorName}</Text>}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </SectionCard>
  );

  return (
    <Screen>
      <FlatList
        data={sortedReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="📄"
            title="No reports yet"
            description="Upload lab reports and prescriptions for quick access."
            actionLabel="Add Report"
            onAction={() =>
              navigation.navigate('AddReport' as never, { profileId: activeProfileId } as never)
            }
          />
        }
      />
      {sortedReports.length > 0 && (
        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="+ Add Report"
            onPress={() =>
              navigation.navigate('AddReport' as never, { profileId: activeProfileId } as never)
            }
          />
        </View>
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
  listContent: {
    padding: spacing.md,
  },
  reportItem: {
    marginBottom: spacing.md,
  },
  reportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  reportDate: {
    ...typography.caption,
    marginBottom: 2,
  },
  reportType: {
    ...typography.caption,
    fontSize: 12,
    marginBottom: 2,
  },
  reportDoctor: {
    ...typography.caption,
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: '#FF3B30',
  },
});
