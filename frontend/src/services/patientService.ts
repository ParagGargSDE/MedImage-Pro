import { apiClient } from './api';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  lastVisit: string;
  status: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface CreatePatientData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicalHistory?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
}

class PatientService {
  async getPatients(params?: { search?: string; limit?: number; offset?: number }): Promise<PatientsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PatientsResponse>(`/patients${query ? `?${query}` : ''}`);
  }

  async getPatient(id: string): Promise<Patient> {
    return apiClient.get<Patient>(`/patients/${id}`);
  }

  async createPatient(data: CreatePatientData): Promise<Patient> {
    return apiClient.post<Patient>('/patients', data);
  }

  async updatePatient(id: string, data: Partial<CreatePatientData>): Promise<Patient> {
    return apiClient.put<Patient>(`/patients/${id}`, data);
  }

  async deletePatient(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/patients/${id}`);
  }

  async getPatientImages(id: string): Promise<{ images: any[] }> {
    return apiClient.get<{ images: any[] }>(`/patients/${id}/images`);
  }

  async getPatientReports(id: string): Promise<{ reports: any[] }> {
    return apiClient.get<{ reports: any[] }>(`/patients/${id}/reports`);
  }
}

export const patientService = new PatientService();