import { useQuery, useMutation } from '@tanstack/react-query';
import { auditService, type AuditFilters } from '@/services/auditService';
import { useToast } from '@/hooks/use-toast';

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getAuditLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (audit logs should be fresh)
  });
}

export function useTrackAction() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ action, details, resourceType, resourceId }: {
      action: string;
      details: string;
      resourceType?: string;
      resourceId?: string;
    }) => auditService.trackAction(action, details, resourceType, resourceId),
    onError: (error) => {
      // Audit tracking errors shouldn't be shown to users
      console.error('Failed to track action:', error);
    },
  });
}

export function useExportAuditLogs() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: AuditFilters; format?: 'csv' | 'pdf' }) =>
      auditService.exportAuditLogs(filters, format),
    onSuccess: (result) => {
      toast({
        title: 'Export Ready',
        description: 'Audit logs export is ready for download',
      });
      console.log('Download URL:', result.downloadUrl);
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs',
        variant: 'destructive',
      });
    },
  });
}