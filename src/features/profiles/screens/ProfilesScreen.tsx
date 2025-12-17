import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProfilesList } from '../hooks/useProfilesList';
import { useDeleteProfile } from '../hooks/useDeleteProfile';
import { useActiveProfileStore } from '@store/activeProfile.store';
import type { PersonProfile } from '../types';

export const ProfilesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data, isLoading, error } = useProfilesList();
  const deleteProfile = useDeleteProfile();
  const { activeProfileId, setActiveProfileId } = useActiveProfileStore();

  useEffect(() => {
    if (data?.items && data.items.length > 0 && !activeProfileId) {
      setActiveProfileId(data.items[0].id);
    }
  }, [data, activeProfileId, setActiveProfileId]);

  const handleDelete = (profile: PersonProfile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${profile.fullName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProfile.mutate(profile.id),
        },
      ]
    );
  };

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    navigation.navigate('ProfileDetail' as never, { profileId } as never);
  };

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
        <Text style={styles.errorText}>Failed to load profiles</Text>
      </View>
    );
  }

  const renderProfileItem = ({ item }: { item: PersonProfile }) => (
    <TouchableOpacity
      style={[
        styles.profileItem,
        activeProfileId === item.id && styles.activeProfileItem,
      ]}
      onPress={() => handleSelectProfile(item.id)}
    >
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.fullName}</Text>
        <Text style={styles.profileRelation}>{item.relationToAccount}</Text>
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
        data={data?.items || []}
        renderItem={renderProfileItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No profiles yet</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ProfileEditor' as never, { mode: 'create' } as never)}
      >
        <Text style={styles.addButtonText}>+ Add Profile</Text>
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
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfileItem: {
    borderColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileRelation: {
    fontSize: 14,
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
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
