import { apiClient } from './api';

export interface MedicalReport {
  id: string;
  patientId: string;
  imageId: string;
  findings: string;
  diagnosis: string;
  recommendations: string;
  createdBy: string;
  createdAt: string;
  status: 'Draft' | 'Final' | 'Reviewed';
  confidence: number;
}

export interface ReportsResponse {
  reports: MedicalReport[];
  total: number;
}

export interface CreateReportData {
  patientId: string;
  imageId: string;
  findings: string;
  diagnosis: string;
  recommendations: string;
}

export interface GenerateReportData {
  imageId: string;
  patientId: string;
  context?: string;
}

class ReportService {
  async getReports(params?: { patientId?: string; status?: string; limit?: number; offset?: number }): Promise<ReportsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<ReportsResponse>(`/reports${query ? `?${query}` : ''}`);
  }

  async getReport(id: string): Promise<MedicalReport> {
    return apiClient.get<MedicalReport>(`/reports/${id}`);
  }

  async createReport(data: CreateReportData): Promise<MedicalReport> {
    return apiClient.post<MedicalReport>('/reports', data);
  }

  async updateReport(id: string, data: Partial<CreateReportData>): Promise<MedicalReport> {
    return apiClient.put<MedicalReport>(`/reports/${id}`, data);
  }

  async deleteReport(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/reports/${id}`);
  }

  async generateReport(data: GenerateReportData): Promise<MedicalReport> {
    return apiClient.post<MedicalReport>('/reports/generate', data);
  }

  async finalizeReport(id: string): Promise<MedicalReport> {
    return apiClient.post<MedicalReport>(`/reports/${id}/finalize`);
  }

  async exportReport(id: string, format: 'pdf' | 'doc'): Promise<{ downloadUrl: string }> {
    return apiClient.post<{ downloadUrl: string }>(`/reports/${id}/export`, { format });
  }

  async shareReport(id: string, recipientEmail: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/reports/${id}/share`, { recipientEmail });
  }
}

export const reportService = new ReportService();