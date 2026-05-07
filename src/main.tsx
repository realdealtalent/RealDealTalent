// Only mount the React admin app when navigating to /admin paths
if (window.location.pathname.startsWith('/admin')) {
  // Dynamically import CSS and app only on admin routes
  // so Tailwind styles don't leak onto the landing page
  import('./index.css');
  import('react-dom/client').then(({ createRoot }) => {
    import('./App.tsx').then(({ default: App }) => {
      const root = document.getElementById("root");
      if (root) {
        root.style.display = 'block';
        document.querySelectorAll('body > :not(#root):not(script)').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
        createRoot(root).render(<App />);
      }
    });
  });
}
