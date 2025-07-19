import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService, type MedicalReport, type CreateReportData, type GenerateReportData } from '@/services/reportService';
import { useToast } from '@/hooks/use-toast';

export function useReports(params?: { patientId?: string; status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportService.getReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: CreateReportData) => reportService.createReport(data),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['patient-reports', newReport.patientId] });
      toast({
        title: 'Success',
        description: 'Report created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create report',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReportData> }) =>
      reportService.updateReport(id, data),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', updatedReport.id] });
      toast({
        title: 'Success',
        description: 'Report updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive',
      });
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: GenerateReportData) => reportService.generateReport(data),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['patient-reports', newReport.patientId] });
      toast({
        title: 'AI Report Generated',
        description: 'Draft report has been generated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    },
  });
}

export function useFinalizeReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => reportService.finalizeReport(id),
    onSuccess: (finalizedReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', finalizedReport.id] });
      toast({
        title: 'Report Finalized',
        description: 'Report has been marked as final',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to finalize report',
        variant: 'destructive',
      });
    },
  });
}

export function useExportReport() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'doc' }) =>
      reportService.exportReport(id, format),
    onSuccess: (result) => {
      toast({
        title: 'Export Ready',
        description: 'Report export is ready for download',
      });
      // In a real app, you would initiate the download here
      console.log('Download URL:', result.downloadUrl);
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    },
  });
}