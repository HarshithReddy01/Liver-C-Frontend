const API_BASE_URL = 'https://harshithreddy01-srmamamba-liver-segmentation.hf.space/api';

export interface SegmentationRequest {
  file: File;
  modality: 'T1' | 'T2';
  slice_idx?: number;
}

export interface Statistics {
  volume_shape: number[];
  liver_voxels: number;
  total_voxels: number;
  liver_percentage: number;
  slice_index: number;
  total_slices: number;
  modality: string;
  liver_volume_ml: number;
}

export interface MedicalReport {
  patient_id: string;
  study_date: string;
  modality: string;
  findings: string[];
  measurements: {
    liver_volume_ml: number;
    liver_percentage: number;
    volume_shape: number[];
    morphology: {
      connected_components: number;
      largest_component_ratio: number;
      fragmentation: string;
    };
  };
  impression: string;
  recommendations: string[];
  severity: string;
  disclaimer: string;
}

export interface SegmentationResponse {
  success: boolean;
  overlay_image?: string;
  segmentation_file?: string;
  statistics?: Statistics;
  medical_report?: MedicalReport;
  error?: string;
}

export async function segmentLiver(request: SegmentationRequest): Promise<SegmentationResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('modality', request.modality);
  if (request.slice_idx !== undefined) {
    formData.append('slice_idx', request.slice_idx.toString());
  }

  try {
    const response = await fetch(`${API_BASE_URL}/segment`, {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      let errorMsg = `Server returned non-JSON response (${response.status})`;
      
      if (text.includes('Internal Server Error') || text.includes('500')) {
        errorMsg = 'Internal server error. The model may be loading or there was an error processing your file. Please try again in a moment.';
      } else if (text.includes('Method Not Allowed') || text.includes('405')) {
        errorMsg = 'Method not allowed. Please check the API endpoint.';
      } else if (text.length < 500) {
        errorMsg = `Server error: ${text.substring(0, 200)}`;
      }
      
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data: SegmentationResponse = await response.json();
    
    if (!response.ok || !data.success) {
      const errorMsg = data.error || `HTTP error! status: ${response.status}`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Server returned invalid JSON. The backend may be experiencing issues.',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function healthCheck(): Promise<{ status: string; device: string; model_t1_loaded: boolean; model_t2_loaded: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export function downloadBase64File(base64Data: string, filename: string, mimeType: string): void {
  try {
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
}

