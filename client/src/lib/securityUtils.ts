/**
 * Security utilities to prevent inspection and right-click
 */

export const securityInit = (): void => {
  if (typeof window !== 'undefined') {
    // Disable right-click
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      return false;
    });

    // Disable keyboard shortcuts for inspect element
    document.addEventListener('keydown', e => {
      // Disable F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+I (Chrome, Firefox)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Chrome)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+C (Chrome)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    });

    // Additional security measures
    // Disable console access (for production only, not development)
    if (process.env.NODE_ENV === 'production') {
      const preventDevTools = () => {
        // Detect if DevTools is open by measuring console.log output timing
        const startTime = performance.now();
        console.log('Inspection not allowed');
        console.clear();
        const endTime = performance.now();
        
        // If it takes too long, DevTools might be open
        if (endTime - startTime > 100) {
          document.body.innerHTML = 'Hacking attempt detected. Connection terminated.';
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      };
      
      setInterval(preventDevTools, 1000);
    }
  }
};

export default securityInit;
