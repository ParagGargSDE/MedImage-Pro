
import React, { useState } from 'react';
import { Shield, Clock, User, Activity, Download, Filter, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLogs, useExportAuditLogs } from '@/hooks/useAuditLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const AuditLogs = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useAuditLogs({
    ...filters,
    limit: 50,
  });
  const exportMutation = useExportAuditLogs();

  const auditLogs = data?.auditLogs || [];
  const filteredLogs = auditLogs.filter(log =>
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'pdf') => {
    exportMutation.mutate({ filters, format });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return <Shield className="h-4 w-4" />;
      case 'VIEW_IMAGE':
        return <Activity className="h-4 w-4" />;
      case 'CREATE_REPORT':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'text-green-600 bg-green-100';
      case 'LOGOUT':
        return 'text-red-600 bg-red-100';
      case 'VIEW_IMAGE':
        return 'text-blue-600 bg-blue-100';
      case 'CREATE_REPORT':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load audit logs. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>System activity and user actions</CardDescription>
            </div>
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access Only
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="VIEW_IMAGE">View Image</SelectItem>
                <SelectItem value="CREATE_REPORT">Create Report</SelectItem>
                <SelectItem value="UPDATE_PROFILE">Update Profile</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="font-medium">{log.userName}</p>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        <Badge variant="outline" className="mt-1">
                          {log.action}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {filteredLogs.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {data?.total || 0} audit logs
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
