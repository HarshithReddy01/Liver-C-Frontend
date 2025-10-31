import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading Application</h1>
      <p>Please check the browser console for details.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
