import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Only mount the React admin app when navigating to /admin paths
if (window.location.pathname.startsWith('/admin')) {
  const root = document.getElementById("root");
  if (root) {
    // Show the root element and hide the static landing page content
    root.style.display = 'block';
    document.querySelectorAll('body > :not(#root):not(script)').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    createRoot(root).render(<App />);
  }
}
