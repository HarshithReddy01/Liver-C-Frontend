import React, { useState } from 'react';
import { segmentLiver, downloadBase64File, SegmentationResponse } from '../services/api';

export function LiverSegmentation() {
  const [file, setFile] = useState<File | null>(null);
  const [modality, setModality] = useState<'T1' | 'T2'>('T1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SegmentationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setResult(null);
      setError(null);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-2">Liver Segmentation</h1>
        <p className="text-gray-600 mb-6">Upload a 3D NIfTI MRI volume for automatic liver segmentation</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">NIfTI File (.nii.gz or .nii)</label>
            <input
              type="file"
              accept=".nii,.nii.gz"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">MRI Modality</label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as 'T1' | 'T2')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="T1">T1-weighted</option>
              <option value="T2">T2-weighted</option>
            </select>
          </div>

          <button
            onClick={handleSegment}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Segment Liver'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>

      {result?.success && result.overlay_image && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Segmentation Overlay</h2>
            <img
              src={result.overlay_image}
              alt="Segmentation Overlay"
              className="w-full rounded-lg border"
            />
          </div>

          {result.statistics && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Liver Volume</p>
                  <p className="text-2xl font-bold">{result.statistics.liver_volume_ml} ml</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Liver Percentage</p>
                  <p className="text-2xl font-bold">{result.statistics.liver_percentage.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Liver Voxels</p>
                  <p className="text-2xl font-bold">{result.statistics.liver_voxels.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Volume Shape</p>
                  <p className="text-lg font-semibold">{result.statistics.volume_shape.join(' × ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Slice</p>
                  <p className="text-lg font-semibold">
                    {result.statistics.slice_index + 1} / {result.statistics.total_slices}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modality</p>
                  <p className="text-lg font-semibold">{result.statistics.modality}</p>
                </div>
              </div>
            </div>
          )}

          {result.medical_report && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Medical Report</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(result.medical_report.severity)}`}>
                  {result.medical_report.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Study Date: {result.medical_report.study_date} | Modality: {result.medical_report.modality}
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Findings</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.medical_report.findings.map((finding, index) => (
                      <li key={index} className="text-sm">{finding}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Measurements</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Liver Volume:</span>{' '}
                      <span className="font-semibold">{result.medical_report.measurements.liver_volume_ml} ml</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Liver Percentage:</span>{' '}
                      <span className="font-semibold">{result.medical_report.measurements.liver_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fragmentation:</span>{' '}
                      <span className="font-semibold">{result.medical_report.measurements.morphology.fragmentation}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Components:</span>{' '}
                      <span className="font-semibold">{result.medical_report.measurements.morphology.connected_components}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Impression</h3>
                  <p className="text-sm">{result.medical_report.impression}</p>
                </div>

                {result.medical_report.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.medical_report.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-xs">
                  {result.medical_report.disclaimer}
                </div>
              </div>
            </div>
          )}

          {result.segmentation_file && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Segmentation Mask (.nii.gz)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
