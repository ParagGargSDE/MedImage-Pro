import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imageService, type MedicalImage, type UploadImageData, type Annotation } from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';

export function useImages(params?: { patientId?: string; type?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['images', params],
    queryFn: () => imageService.getImages(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useImage(id: string) {
  return useQuery({
    queryKey: ['image', id],
    queryFn: () => imageService.getImage(id),
    enabled: !!id,
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: UploadImageData) => imageService.uploadImage(data),
    onSuccess: (newImage) => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['patient-images', newImage.patientId] });
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalImage> }) =>
      imageService.updateImage(id, data),
    onSuccess: (updatedImage) => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['image', updatedImage.id] });
      toast({
        title: 'Success',
        description: 'Image updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update image',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => imageService.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    },
  });
}

export function useAddAnnotation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ imageId, annotation }: { imageId: string; annotation: Omit<Annotation, 'id' | 'createdAt'> }) =>
      imageService.addAnnotation(imageId, annotation),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['image', variables.imageId] });
      toast({
        title: 'Success',
        description: 'Annotation added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add annotation',
        variant: 'destructive',
      });
    },
  });
}

export function useAnalyzeImage() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (imageId: string) => imageService.analyzeImage(imageId),
    onSuccess: (result) => {
      toast({
        title: 'Analysis Complete',
        description: `Analysis completed with ${Math.round(result.confidence * 100)}% confidence`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to analyze image',
        variant: 'destructive',
      });
    },
  });
}