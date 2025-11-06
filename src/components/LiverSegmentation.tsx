import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack
} from '@mui/material';
import { 
  CloudUpload, 
  Download, 
  Assessment, 
  Image as ImageIcon,
  Science
} from '@mui/icons-material';
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
        return 'success';
      case 'mild':
        return 'warning';
      case 'moderate':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Liver Segmentation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload a 3D NIfTI MRI volume for automatic liver segmentation
        </Typography>

        <Box sx={{ mt: 3, space: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  NIfTI File (.nii.gz or .nii)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {file ? file.name : 'Choose File'}
                  <input
                    type="file"
                    accept=".nii,.nii.gz"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  MRI Modality
                </Typography>
                <Box
                  component="select"
                  value={modality}
                  onChange={(e) => setModality(e.target.value as 'T1' | 'T2')}
                  disabled={loading}
                  sx={{
                    width: '100%',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    '&:focus': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2
                    }
                  }}
                >
                  <option value="T1">T1-weighted</option>
                  <option value="T2">T2-weighted</option>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSegment}
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Science />}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? 'Processing...' : 'Segment Liver'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>

      {result?.success && result.overlay_image && (
        <>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Segmentation Overlay
            </Typography>
            <Box
              component="img"
              src={result.overlay_image}
              alt="Segmentation Overlay"
              sx={{
                width: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                mt: 2
              }}
            />
          </Paper>

          {result.statistics && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                Statistics
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Liver Volume
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {result.statistics.liver_volume_ml} ml
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Liver Percentage
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {result.statistics.liver_percentage.toFixed(2)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Liver Voxels
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {result.statistics.liver_voxels.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Volume Shape
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {result.statistics.volume_shape.join(' × ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Slice
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {result.statistics.slice_index + 1} / {result.statistics.total_slices}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Modality
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {result.statistics.modality}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {result.medical_report && (
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Medical Report
                </Typography>
                <Chip
                  label={result.medical_report.severity.toUpperCase()}
                  color={getSeverityColor(result.medical_report.severity) as any}
                  size="medium"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Study Date: {result.medical_report.study_date} | Modality: {result.medical_report.modality}
              </Typography>

              {!showReport ? (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Assessment />}
                    onClick={handleGenerateReport}
                    size="large"
                  >
                    Generate Report
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Findings
                  </Typography>
                  <List dense>
                    {result.medical_report.findings.map((finding, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={finding} />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Measurements
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Liver Volume:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {result.medical_report.measurements.liver_volume_ml} ml
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Liver Percentage:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {result.medical_report.measurements.liver_percentage}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fragmentation:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {result.medical_report.measurements.morphology.fragmentation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Connected Components:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {result.medical_report.measurements.morphology.connected_components}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Impression
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {result.medical_report.impression}
                  </Typography>

                  {result.medical_report.recommendations.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Recommendations
                      </Typography>
                      <List dense>
                        {result.medical_report.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}

                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {result.medical_report.disclaimer}
                  </Alert>
                </Box>
              )}
            </Paper>
          )}

          {result.segmentation_file && (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={handleDownload}
                startIcon={<Download />}
                sx={{ py: 1.5 }}
              >
                Download Segmentation Mask (.nii.gz)
              </Button>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}
