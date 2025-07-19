import { apiClient } from './api';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  resourceType?: string;
  resourceId?: string;
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[];
  total: number;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

class AuditService {
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const queryParams = new URLSearchParams();
    if (filters?.userId) queryParams.append('userId', filters.userId);
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.resourceType) queryParams.append('resourceType', filters.resourceType);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<AuditLogsResponse>(`/audit-logs${query ? `?${query}` : ''}`);
  }

  async createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>): Promise<AuditLog> {
    return apiClient.post<AuditLog>('/audit-logs', data);
  }

  async exportAuditLogs(filters?: AuditFilters, format: 'csv' | 'pdf' = 'csv'): Promise<{ downloadUrl: string }> {
    return apiClient.post<{ downloadUrl: string }>('/audit-logs/export', { filters, format });
  }

  // Helper method to track user actions
  async trackAction(action: string, details: string, resourceType?: string, resourceId?: string): Promise<void> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      await this.createAuditLog({
        userId: user.id,
        userName: user.name,
        action,
        details,
        resourceType,
        resourceId
      });
    }
  }
}

export const auditService = new AuditService();