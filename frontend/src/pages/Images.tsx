import React, { useState } from 'react';
import { Upload, Search, Image as ImageIcon, Eye, Download, Trash2, Filter } from 'lucide-react';
import { useImages, useUploadImage, useDeleteImage } from '@/hooks/useImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Images = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    patientId: '',
    type: '',
    bodyPart: '',
    notes: '',
    file: null as File | null
  });

  const { data, isLoading, error } = useImages({
    type: filterType || undefined,
    limit: 20
  });
  
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();
  const { toast } = useToast();

  const images = data?.images || [];
  const filteredImages = images.filter(image =>
    image.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadImage = async () => {
    if (!uploadData.file) return;
    
    try {
      await uploadImageMutation.mutateAsync({
        patientId: uploadData.patientId,
        type: uploadData.type,
        bodyPart: uploadData.bodyPart,
        notes: uploadData.notes,
        file: uploadData.file
      });
      
      setIsUploadDialogOpen(false);
      setUploadData({
        patientId: '',
        type: '',
        bodyPart: '',
        notes: '',
        file: null
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImageMutation.mutateAsync(imageId);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Analyzed':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load images. Please try again.</p>
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
                <ImageIcon className="h-5 w-5" />
                Medical Images
              </CardTitle>
              <CardDescription>Manage and analyze medical imaging data</CardDescription>
            </div>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Medical Image</DialogTitle>
                  <DialogDescription>
                    Upload a new medical image for analysis.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="patient-id">Patient ID</Label>
                    <Input
                      id="patient-id"
                      value={uploadData.patientId}
                      onChange={(e) => setUploadData(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="P001"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Image Type</Label>
                      <Select value={uploadData.type} onValueChange={(value) => setUploadData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X-Ray">X-Ray</SelectItem>
                          <SelectItem value="MRI">MRI</SelectItem>
                          <SelectItem value="CT Scan">CT Scan</SelectItem>
                          <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="body-part">Body Part</Label>
                      <Input
                        id="body-part"
                        value={uploadData.bodyPart}
                        onChange={(e) => setUploadData(prev => ({ ...prev, bodyPart: e.target.value }))}
                        placeholder="Chest"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={uploadData.notes}
                      onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="file">Image File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadData(prev => ({ 
                        ...prev, 
                        file: e.target.files ? e.target.files[0] : null 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploadImageMutation.isPending || !uploadData.file || !uploadData.patientId}
                  >
                    {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT Scan">CT Scan</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          // Loading skeleton
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterType ? 'No images found matching your criteria' : 'No images uploaded yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="aspect-square bg-muted rounded-md overflow-hidden">
                      <img
                        src={image.url}
                        alt={`${image.type} of ${image.bodyPart}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{image.type}</h3>
                        <Badge className={getStatusColor(image.status)}>
                          {image.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Body Part: {image.bodyPart}</p>
                        <p>Patient: {image.patientId}</p>
                        <p>Date: {new Date(image.date).toLocaleDateString()}</p>
                      </div>
                      
                      {image.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {image.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteImage(image.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredImages.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredImages.length} of {data?.total || 0} images
          </div>
        )}
      </div>
    </div>
  );
};

export default Images;