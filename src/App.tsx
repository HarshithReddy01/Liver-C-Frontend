import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SegmentationPage from './pages/SegmentationPage'

function App() {
  return (
    <BrowserRouter basename="/Liver-C-Frontend">
      <Routes>
        <Route path="/" element={<SegmentationPage />} />
        <Route path="/segmentation" element={<SegmentationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

