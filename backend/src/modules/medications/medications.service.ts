import { v4 as uuidv4 } from 'uuid';
import type {
  CreateMedicationInput,
  Medication,
  MedicationsListParams,
  UpdateMedicationInput,
} from './medications.types';

// In-memory storage: profileId -> medications[]
const medicationsByProfile = new Map<string, Medication[]>();

export const medicationsService = {
  create: (profileId: string, data: CreateMedicationInput): Medication => {
    const medications = medicationsByProfile.get(profileId) || [];
    const now = new Date().toISOString();

    const medication: Medication = {
      id: `med_${uuidv4().replace(/-/g, '')}`,
      profileId,
      name: data.name,
      genericName: data.genericName,
      dose: data.dose,
      doseUnit: data.doseUnit,
      frequency: data.frequency,
      schedule: data.schedule,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      conditionProfileId: data.conditionProfileId,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    medications.push(medication);
    medicationsByProfile.set(profileId, medications);

    return medication;
  },

  list: (
    profileId: string,
    params?: MedicationsListParams
  ): { items: Medication[]; meta: { page: number; limit: number; total: number } } => {
    let medications = medicationsByProfile.get(profileId) || [];

    // Filter by status
    if (params?.status) {
      medications = medications.filter((m) => m.status === params.status);
    }

    // Sort by createdAt descending (newest first)
    medications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const total = medications.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = medications.slice(start, end);

    return {
      items: paginated,
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  getById: (profileId: string, medicationId: string): Medication | undefined => {
    const medications = medicationsByProfile.get(profileId) || [];
    return medications.find((m) => m.id === medicationId);
  },

  update: (profileId: string, medicationId: string, data: UpdateMedicationInput): Medication | null => {
    const medications = medicationsByProfile.get(profileId) || [];
    const medication = medications.find((m) => m.id === medicationId);

    if (!medication) {
      return null;
    }

    Object.assign(medication, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    medicationsByProfile.set(profileId, medications);
    return medication;
  },

  delete: (profileId: string, medicationId: string): boolean => {
    const medications = medicationsByProfile.get(profileId) || [];
    const index = medications.findIndex((m) => m.id === medicationId);

    if (index === -1) {
      return false;
    }

    medications.splice(index, 1);
    medicationsByProfile.set(profileId, medications);
    return true;
  },
};

