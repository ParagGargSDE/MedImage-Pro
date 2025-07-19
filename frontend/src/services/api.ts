// API configuration and base client
export const API_BASE_URL = 'https://api.medicalimaging.demo';

// API client with error handling
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      
      // Simulate API response based on endpoint
      const response = await this.simulateResponse<T>(endpoint, config);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private async simulateResponse<T>(endpoint: string, config: RequestInit): Promise<T> {
    // Simulate different responses based on endpoint
    const method = config.method || 'GET';
    const fullUrl = `${this.baseURL}${endpoint}`;
    
    console.log(`[API] ${method} ${fullUrl}`);
    
    // Simulate successful responses with dummy data
    return this.getDummyResponse<T>(endpoint, method, config.body);
  }

  private getDummyResponse<T>(endpoint: string, method: string, body?: BodyInit | null): T {
    // Import dummy data based on endpoint pattern
    if (endpoint.includes('/patients')) {
      return this.getPatientResponse(endpoint, method, body) as T;
    }
    if (endpoint.includes('/images')) {
      return this.getImageResponse(endpoint, method, body) as T;
    }
    if (endpoint.includes('/reports')) {
      return this.getReportResponse(endpoint, method, body) as T;
    }
    if (endpoint.includes('/audit-logs')) {
      return this.getAuditResponse(endpoint, method, body) as T;
    }
    if (endpoint.includes('/auth')) {
      return this.getAuthResponse(endpoint, method, body) as T;
    }
    
    // Default response
    return { success: true, message: 'Operation completed' } as T;
  }

  private getPatientResponse(endpoint: string, method: string, body?: BodyInit | null): any {
    const dummyPatients = [
      {
        id: 'P001',
        name: 'John Doe',
        age: 45,
        gender: 'Male',
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        lastVisit: '2024-01-15',
        status: 'Active',
        phone: '+1-555-0123',
        email: 'john.doe@email.com',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1-555-0124'
        }
      },
      {
        id: 'P002',
        name: 'Sarah Johnson',
        age: 32,
        gender: 'Female',
        medicalHistory: ['Asthma'],
        lastVisit: '2024-01-20',
        status: 'Active',
        phone: '+1-555-0125',
        email: 'sarah.johnson@email.com',
        emergencyContact: {
          name: 'Michael Johnson',
          relationship: 'Husband',
          phone: '+1-555-0126'
        }
      },
      {
        id: 'P003',
        name: 'Robert Chen',
        age: 67,
        gender: 'Male',
        medicalHistory: ['Heart Disease', 'High Cholesterol'],
        lastVisit: '2024-01-18',
        status: 'Active',
        phone: '+1-555-0127',
        email: 'robert.chen@email.com',
        emergencyContact: {
          name: 'Lisa Chen',
          relationship: 'Daughter',
          phone: '+1-555-0128'
        }
      }
    ];

    if (method === 'GET') {
      if (endpoint.includes('/patients/')) {
        const patientId = endpoint.split('/').pop();
        return dummyPatients.find(p => p.id === patientId) || null;
      }
      return { patients: dummyPatients, total: dummyPatients.length };
    }
    
    if (method === 'POST') {
      const newPatient = JSON.parse(body as string);
      return { ...newPatient, id: `P${String(dummyPatients.length + 1).padStart(3, '0')}` };
    }
    
    return { success: true };
  }

  private getImageResponse(endpoint: string, method: string, body?: BodyInit | null): any {
    const dummyImages = [
      {
        id: 'IMG001',
        patientId: 'P001',
        type: 'X-Ray',
        bodyPart: 'Chest',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoZXN0IFgtUmF5PC90ZXh0Pgo8L3N2Zz4K',
        date: '2024-01-15',
        notes: 'Routine chest examination',
        status: 'Analyzed',
        annotations: []
      },
      {
        id: 'IMG002',
        patientId: 'P002',
        type: 'MRI',
        bodyPart: 'Brain',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyYWluIE1SSTwvdGV4dD4KPC9zdmc+Cg==',
        date: '2024-01-20',
        notes: 'Brain scan for headache evaluation',
        status: 'Pending Review',
        annotations: []
      }
    ];

    if (method === 'GET') {
      if (endpoint.includes('/images/')) {
        const imageId = endpoint.split('/').pop();
        return dummyImages.find(img => img.id === imageId) || null;
      }
      return { images: dummyImages, total: dummyImages.length };
    }
    
    return { success: true };
  }

  private getReportResponse(endpoint: string, method: string, body?: BodyInit | null): any {
    const dummyReports = [
      {
        id: 'RPT001',
        patientId: 'P001',
        imageId: 'IMG001',
        findings: 'The chest X-ray shows clear lung fields with no evidence of acute cardiopulmonary abnormalities. Heart size appears normal. No pneumothorax or pleural effusion detected.',
        diagnosis: 'Normal chest X-ray',
        recommendations: 'Continue routine monitoring. Follow up in 12 months for routine screening.',
        createdBy: 'Dr. Sarah Johnson',
        createdAt: '2024-01-15T10:30:00Z',
        status: 'Final',
        confidence: 0.95
      },
      {
        id: 'RPT002',
        patientId: 'P002',
        imageId: 'IMG002',
        findings: 'Brain MRI demonstrates normal gray and white matter signal intensity. No mass lesions, hemorrhage, or midline shift identified. Ventricular system appears normal.',
        diagnosis: 'Normal brain MRI',
        recommendations: 'No acute abnormalities detected. Consider follow-up if symptoms persist.',
        createdBy: 'Dr. Maria Garcia',
        createdAt: '2024-01-20T14:15:00Z',
        status: 'Draft',
        confidence: 0.92
      }
    ];

    if (method === 'GET') {
      if (endpoint.includes('/reports/')) {
        const reportId = endpoint.split('/').pop();
        return dummyReports.find(report => report.id === reportId) || null;
      }
      return { reports: dummyReports, total: dummyReports.length };
    }
    
    if (method === 'POST') {
      const newReport = JSON.parse(body as string);
      return { 
        ...newReport, 
        id: `RPT${String(dummyReports.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        status: 'Draft'
      };
    }
    
    return { success: true };
  }

  private getAuditResponse(endpoint: string, method: string, body?: BodyInit | null): any {
    const dummyAuditLogs = [
      {
        id: '1',
        userId: '2',
        userName: 'John Smith',
        action: 'LOGIN',
        details: 'User logged in successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        userId: '3',
        userName: 'Dr. Maria Garcia',
        action: 'VIEW_IMAGE',
        details: 'Viewed chest X-ray for patient P001',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        userId: '1',
        userName: 'Dr. Sarah Johnson',
        action: 'CREATE_REPORT',
        details: 'Generated diagnostic report for patient P002',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        ipAddress: '192.168.1.102'
      }
    ];

    return { auditLogs: dummyAuditLogs, total: dummyAuditLogs.length };
  }

  private getAuthResponse(endpoint: string, method: string, body?: BodyInit | null): any {
    if (endpoint.includes('/login')) {
      return {
        token: 'dummy.jwt.token.here',
        user: {
          id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          role: 'admin',
          permissions: ['view_patients', 'edit_patients', 'view_images', 'create_reports', 'view_audit_logs'],
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
        }
      };
    }
    
    if (endpoint.includes('/refresh')) {
      return {
        token: 'refreshed.jwt.token.here'
      };
    }
    
    return { success: true };
  }

  // Public methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);