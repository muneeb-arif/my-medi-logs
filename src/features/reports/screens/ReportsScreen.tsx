import { useNavigation } from '@react-navigation/native';
import { useActiveProfileStore } from '@store/activeProfile.store';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No active profile selected</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.getParent()?.navigate('Profiles' as never);
          }}
        >
          <Text style={styles.buttonText}>Select or Create Profile</Text>
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
        <Text style={styles.errorText}>Failed to load reports</Text>
      </View>
    );
  }

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportItem}
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
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No reports yet</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('AddReport' as never, { profileId: activeProfileId } as never)
        }
      >
        <Text style={styles.addButtonText}>+ Add Report</Text>
      </TouchableOpacity>
    </View>
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
    padding: 32,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  reportDoctor: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
