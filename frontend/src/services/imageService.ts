import { apiClient } from './api';

export interface MedicalImage {
  id: string;
  patientId: string;
  type: string;
  bodyPart: string;
  url: string;
  date: string;
  notes: string;
  status: string;
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'text' | 'circle' | 'rectangle' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface ImagesResponse {
  images: MedicalImage[];
  total: number;
}

export interface UploadImageData {
  patientId: string;
  type: string;
  bodyPart: string;
  notes?: string;
  file: File;
}

class ImageService {
  async getImages(params?: { patientId?: string; type?: string; limit?: number; offset?: number }): Promise<ImagesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return apiClient.get<ImagesResponse>(`/images${query ? `?${query}` : ''}`);
  }

  async getImage(id: string): Promise<MedicalImage> {
    return apiClient.get<MedicalImage>(`/images/${id}`);
  }

  async uploadImage(data: UploadImageData): Promise<MedicalImage> {
    // In a real app, this would handle FormData for file upload
    // For demo purposes, we'll simulate with base64 data
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async () => {
        const imageData = {
          patientId: data.patientId,
          type: data.type,
          bodyPart: data.bodyPart,
          notes: data.notes,
          url: reader.result as string,
          annotations: []
        };
        const result = await apiClient.post<MedicalImage>('/images', imageData);
        resolve(result);
      };
      reader.readAsDataURL(data.file);
    });
  }

  async updateImage(id: string, data: Partial<MedicalImage>): Promise<MedicalImage> {
    return apiClient.put<MedicalImage>(`/images/${id}`, data);
  }

  async deleteImage(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/images/${id}`);
  }

  async addAnnotation(imageId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<Annotation> {
    return apiClient.post<Annotation>(`/images/${imageId}/annotations`, annotation);
  }

  async updateAnnotation(imageId: string, annotationId: string, data: Partial<Annotation>): Promise<Annotation> {
    return apiClient.put<Annotation>(`/images/${imageId}/annotations/${annotationId}`, data);
  }

  async deleteAnnotation(imageId: string, annotationId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/images/${imageId}/annotations/${annotationId}`);
  }

  async analyzeImage(imageId: string): Promise<{ analysis: any; confidence: number }> {
    return apiClient.post<{ analysis: any; confidence: number }>(`/images/${imageId}/analyze`);
  }
}

export const imageService = new ImageService();