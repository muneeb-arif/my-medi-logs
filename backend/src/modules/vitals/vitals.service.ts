import { v4 as uuidv4 } from 'uuid';
import type { CreateVitalInput, VitalEntry, VitalsListParams } from './vitals.types';

// In-memory storage: profileId -> vitals[]
const vitalsByProfile = new Map<string, VitalEntry[]>();

export const vitalsService = {
  create: (profileId: string, data: CreateVitalInput): VitalEntry => {
    const vitals = vitalsByProfile.get(profileId) || [];
    const now = new Date().toISOString();

    const vital: VitalEntry = {
      id: `vit_${uuidv4().replace(/-/g, '')}`,
      profileId,
      type: data.type,
      value: data.value,
      unit: data.unit,
      recordedAt: data.recordedAt,
      createdAt: now,
      conditionProfileId: data.conditionProfileId,
      notes: data.notes,
    };

    vitals.push(vital);
    vitalsByProfile.set(profileId, vitals);

    return vital;
  },

  list: (
    profileId: string,
    params?: VitalsListParams
  ): { items: VitalEntry[]; meta: { page: number; limit: number; total: number } } => {
    let vitals = vitalsByProfile.get(profileId) || [];

    // Filter by type
    if (params?.type) {
      vitals = vitals.filter((v) => v.type === params.type);
    }

    // Filter by date range
    if (params?.from) {
      const fromDate = new Date(params.from);
      vitals = vitals.filter((v) => new Date(v.recordedAt) >= fromDate);
    }

    if (params?.to) {
      const toDate = new Date(params.to);
      vitals = vitals.filter((v) => new Date(v.recordedAt) <= toDate);
    }

    // Sort by recordedAt descending (newest first)
    vitals.sort((a, b) => {
      const dateA = new Date(a.recordedAt).getTime();
      const dateB = new Date(b.recordedAt).getTime();
      return dateB - dateA;
    });

    const total = vitals.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = vitals.slice(start, end);

    return {
      items: paginated,
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  getById: (profileId: string, vitalId: string): VitalEntry | undefined => {
    const vitals = vitalsByProfile.get(profileId) || [];
    return vitals.find((v) => v.id === vitalId);
  },

  delete: (profileId: string, vitalId: string): boolean => {
    const vitals = vitalsByProfile.get(profileId) || [];
    const index = vitals.findIndex((v) => v.id === vitalId);

    if (index === -1) {
      return false;
    }

    vitals.splice(index, 1);
    vitalsByProfile.set(profileId, vitals);
    return true;
  },
};

