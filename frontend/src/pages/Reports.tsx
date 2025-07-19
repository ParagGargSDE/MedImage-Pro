import React, { useState } from 'react';
import { FileText, Plus, Search, Eye, Edit, Download, Share, Trash2, Brain, CheckCircle } from 'lucide-react';
import { useReports, useCreateReport, useGenerateReport, useFinalizeReport, useExportReport } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    patientId: '',
    imageId: '',
    findings: '',
    diagnosis: '',
    recommendations: ''
  });
  const [generateData, setGenerateData] = useState({
    patientId: '',
    imageId: '',
    context: ''
  });

  const { data, isLoading, error } = useReports({
    status: filterStatus || undefined,
    limit: 20
  });
  
  const createReportMutation = useCreateReport();
  const generateReportMutation = useGenerateReport();
  const finalizeReportMutation = useFinalizeReport();
  const exportReportMutation = useExportReport();
  const { toast } = useToast();

  const reports = data?.reports || [];
  const filteredReports = reports.filter(report =>
    report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.findings.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = async () => {
    try {
      await createReportMutation.mutateAsync({
        patientId: newReport.patientId,
        imageId: newReport.imageId,
        findings: newReport.findings,
        diagnosis: newReport.diagnosis,
        recommendations: newReport.recommendations
      });
      
      setIsCreateDialogOpen(false);
      setNewReport({
        patientId: '',
        imageId: '',
        findings: '',
        diagnosis: '',
        recommendations: ''
      });
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReportMutation.mutateAsync({
        patientId: generateData.patientId,
        imageId: generateData.imageId,
        context: generateData.context
      });
      
      setIsGenerateDialogOpen(false);
      setGenerateData({
        patientId: '',
        imageId: '',
        context: ''
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleFinalizeReport = async (reportId: string) => {
    try {
      await finalizeReportMutation.mutateAsync(reportId);
    } catch (error) {
      console.error('Failed to finalize report:', error);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'doc') => {
    try {
      await exportReportMutation.mutateAsync({ id: reportId, format });
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final':
        return 'bg-green-100 text-green-800';
      case 'Reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load reports. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Reports
              </CardTitle>
              <CardDescription>Create and manage diagnostic reports</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Generate AI Report</DialogTitle>
                    <DialogDescription>
                      Generate a draft report using AI analysis.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="gen-patient-id">Patient ID</Label>
                      <Input
                        id="gen-patient-id"
                        value={generateData.patientId}
                        onChange={(e) => setGenerateData(prev => ({ ...prev, patientId: e.target.value }))}
                        placeholder="P001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gen-image-id">Image ID</Label>
                      <Input
                        id="gen-image-id"
                        value={generateData.imageId}
                        onChange={(e) => setGenerateData(prev => ({ ...prev, imageId: e.target.value }))}
                        placeholder="IMG001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="context">Additional Context</Label>
                      <Textarea
                        id="context"
                        value={generateData.context}
                        onChange={(e) => setGenerateData(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="Patient symptoms, clinical history..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsGenerateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={generateReportMutation.isPending || !generateData.patientId || !generateData.imageId}
                    >
                      {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Report</DialogTitle>
                    <DialogDescription>
                      Create a diagnostic report manually.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="patient-id">Patient ID</Label>
                        <Input
                          id="patient-id"
                          value={newReport.patientId}
                          onChange={(e) => setNewReport(prev => ({ ...prev, patientId: e.target.value }))}
                          placeholder="P001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image-id">Image ID</Label>
                        <Input
                          id="image-id"
                          value={newReport.imageId}
                          onChange={(e) => setNewReport(prev => ({ ...prev, imageId: e.target.value }))}
                          placeholder="IMG001"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="findings">Findings</Label>
                      <Textarea
                        id="findings"
                        value={newReport.findings}
                        onChange={(e) => setNewReport(prev => ({ ...prev, findings: e.target.value }))}
                        placeholder="Describe the imaging findings..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        value={newReport.diagnosis}
                        onChange={(e) => setNewReport(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Primary diagnosis based on findings..."
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        value={newReport.recommendations}
                        onChange={(e) => setNewReport(prev => ({ ...prev, recommendations: e.target.value }))}
                        placeholder="Treatment recommendations and follow-up..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateReport}
                      disabled={createReportMutation.isPending || !newReport.patientId || !newReport.findings}
                    >
                      {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus ? 'No reports found matching your criteria' : 'No reports created yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{report.diagnosis}</h3>
                        <p className="text-sm text-muted-foreground">
                          Patient: {report.patientId} • Image: {report.imageId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.confidence && (
                        <Badge variant="outline">
                          {Math.round(report.confidence * 100)}% confidence
                        </Badge>
                      )}
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Findings:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {report.findings}
                    </p>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      Created by {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div>Report ID: {report.id}</div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    
                    {report.status === 'Draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFinalizeReport(report.id)}
                        disabled={finalizeReportMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalize
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport(report.id, 'pdf')}
                      disabled={exportReportMutation.isPending}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this report? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {filteredReports.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredReports.length} of {data?.total || 0} reports
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;