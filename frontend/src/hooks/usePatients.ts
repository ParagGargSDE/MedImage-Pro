import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, type Patient, type CreatePatientData } from '@/services/patientService';
import { useToast } from '@/hooks/use-toast';

export function usePatients(params?: { search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getPatient(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CreatePatientData) => patientService.createPatient(data),
    onSuccess: (newPatient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Success',
        description: `Patient ${newPatient.name} created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create patient',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePatientData> }) =>
      patientService.updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', updatedPatient.id] });
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update patient',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete patient',
        variant: 'destructive',
      });
    },
  });
}

export function usePatientImages(patientId: string) {
  return useQuery({
    queryKey: ['patient-images', patientId],
    queryFn: () => patientService.getPatientImages(patientId),
    enabled: !!patientId,
  });
}

export function usePatientReports(patientId: string) {
  return useQuery({
    queryKey: ['patient-reports', patientId],
    queryFn: () => patientService.getPatientReports(patientId),
    enabled: !!patientId,
  });
}