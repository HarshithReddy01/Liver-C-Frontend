import React, { useState } from 'react';
import { BiScan } from 'react-icons/bi';
import { FaDownload, FaFileUpload } from 'react-icons/fa';
import { MdAssessment, MdScience } from 'react-icons/md';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { segmentLiver, downloadBase64File, SegmentationResponse } from '../services/api';

export function LiverSegmentation() {
  const [file, setFile] = useState<File | null>(null);
  const [modality, setModality] = useState<'T1' | 'T2'>('T1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SegmentationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setResult(null);
      setError(null);
      setShowReport(false);
    }
  };

  const handleSegment = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowReport(false);

    try {
      const response = await segmentLiver({ file, modality });
      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Segmentation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.segmentation_file) {
      downloadBase64File(result.segmentation_file, 'liver_segmentation.nii.gz', 'application/octet-stream');
    }
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500';
      case 'mild':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500';
      case 'moderate':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Liver <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">Segmentation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload a 3D NIfTI MRI volume for automatic liver segmentation using AI-powered analysis
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <BiScan className="h-6 w-6 text-blue-600" />
                <span>Upload & Analyze</span>
              </CardTitle>
              <CardDescription>
                Select your NIfTI file and MRI modality to begin segmentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm font-medium">NIfTI File (.nii.gz or .nii)</Label>
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      accept=".nii,.nii.gz"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground flex items-center space-x-2 mt-2">
                      <IoCheckmarkCircle className="h-4 w-4 text-green-500" />
                      <span>{file.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modality" className="text-sm font-medium">MRI Modality</Label>
                  <Select value={modality} onValueChange={(value) => setModality(value as 'T1' | 'T2')} disabled={loading}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T1">T1-weighted</SelectItem>
                      <SelectItem value="T2">T2-weighted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSegment}
                disabled={!file || loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white h-12 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MdScience className="mr-2 h-5 w-5" />
                    Segment Liver
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <IoCloseCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {result?.success && result.overlay_image && (
            <>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Segmentation Overlay</CardTitle>
                  <CardDescription>Visual representation of the liver segmentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={result.overlay_image}
                      alt="Segmentation Overlay"
                      className="w-full h-auto"
                    />
                  </div>
                </CardContent>
              </Card>

              {result.statistics && (
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Statistics</CardTitle>
                    <CardDescription>Detailed segmentation metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-muted-foreground mb-1">Liver Volume</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {result.statistics.liver_volume_ml} ml
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-muted-foreground mb-1">Liver Percentage</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {result.statistics.liver_percentage.toFixed(2)}%
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground mb-1">Liver Voxels</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {result.statistics.liver_voxels.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-muted-foreground mb-1">Volume Shape</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {result.statistics.volume_shape.join(' × ')}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-800">
                        <p className="text-sm text-muted-foreground mb-1">Slice</p>
                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                          {result.statistics.slice_index + 1} / {result.statistics.total_slices}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-800">
                        <p className="text-sm text-muted-foreground mb-1">Modality</p>
                        <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
                          {result.statistics.modality}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.medical_report && (
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">Medical Report</CardTitle>
                      <Badge className={getSeverityColor(result.medical_report.severity)}>
                        {result.medical_report.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Study Date: {result.medical_report.study_date} | Modality: {result.medical_report.modality}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showReport ? (
                      <div className="text-center py-8">
                        <Button
                          onClick={handleGenerateReport}
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white"
                        >
                          <MdAssessment className="mr-2 h-5 w-5" />
                          Generate Report
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <IoCheckmarkCircle className="h-5 w-5 text-blue-600" />
                            <span>Findings</span>
                          </h3>
                          <ul className="space-y-2">
                            {result.medical_report.findings.map((finding, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4">Measurements</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">Liver Volume</p>
                              <p className="text-lg font-bold">{result.medical_report.measurements.liver_volume_ml} ml</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">Liver Percentage</p>
                              <p className="text-lg font-bold">{result.medical_report.measurements.liver_percentage}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">Fragmentation</p>
                              <p className="text-lg font-bold">{result.medical_report.measurements.morphology.fragmentation}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">Connected Components</p>
                              <p className="text-lg font-bold">{result.medical_report.measurements.morphology.connected_components}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-2">Impression</h3>
                          <p className="text-sm text-muted-foreground">{result.medical_report.impression}</p>
                        </div>

                        {result.medical_report.recommendations.length > 0 && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                            <ul className="space-y-2">
                              {result.medical_report.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                            {result.medical_report.disclaimer}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {result.segmentation_file && (
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white h-12 text-lg"
                    >
                      <FaDownload className="mr-2 h-5 w-5" />
                      Download Segmentation Mask (.nii.gz)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
