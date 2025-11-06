# Integration Guide

## Backend (Hugging Face Space)

The backend is deployed at: `https://harshithreddy01-srmamamba-liver-segmentation.hf.space`

### API Endpoints

- `POST /api/segment` - Upload NIfTI file for segmentation
- `GET /api/health` - Health check
- `GET /docs` - Interactive API documentation

### Response Format

```json
{
  "success": true,
  "overlay_image": "data:image/png;base64,...",
  "segmentation_file": "data:application/octet-stream;base64,...",
  "statistics": {
    "volume_shape": [1, 224, 224, 64],
    "liver_voxels": 1234567,
    "total_voxels": 3211264,
    "liver_percentage": 38.45,
    "slice_index": 32,
    "total_slices": 64,
    "modality": "T1",
    "liver_volume_ml": 1234.56
  },
  "medical_report": {
    "patient_id": "N/A",
    "study_date": "2025-11-06 20:15:21",
    "modality": "T1",
    "findings": ["..."],
    "measurements": {...},
    "impression": "...",
    "recommendations": ["..."],
    "severity": "normal",
    "disclaimer": "..."
  }
}
```

## Frontend (GitHub Pages)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `src/services/api.ts` if needed

3. Add route to your router:
```tsx
import SegmentationPage from '@/pages/SegmentationPage';

<Route path="/segmentation" element={<SegmentationPage />} />
```

4. Build and deploy:
```bash
npm run build
npm run deploy
```

### Usage

The `LiverSegmentation` component handles:
- File upload
- API communication
- Result display
- Medical report rendering
- File download

### Components

- `src/services/api.ts` - API service functions
- `src/components/LiverSegmentation.tsx` - Main segmentation component
- `src/pages/SegmentationPage.tsx` - Page wrapper

