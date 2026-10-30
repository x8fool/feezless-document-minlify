(() => {
  if (window.__feezlessMakeformDrawerInstalled) return;
  window.__feezlessMakeformDrawerInstalled = true;

  const triggerSelector = '[data-feezless-contact="pay-per-request"]';
  const sdkUrl = 'https://www.makeform.ai/widgets/embed.js';

  function activateSliders() {
    if (typeof window.MakeForm?.loadSliders === 'function') {
      window.MakeForm.loadSliders();
    }
  }

  function initializeDrawer() {
    if (!document.querySelector(triggerSelector)) return;

    if (typeof window.MakeForm?.loadSliders === 'function') {
      activateSliders();
      return;
    }

    const existingScript = document.querySelector(`script[src="${sdkUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', activateSliders, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'feezless-makeform-sdk';
    script.src = sdkUrl;
    script.async = true;
    script.addEventListener('load', activateSliders, { once: true });
    script.addEventListener('error', () => script.remove(), { once: true });
    document.head.appendChild(script);
  }

  // Initialize after the first render and again after client-side navigation.
  initializeDrawer();
  window.addEventListener('mintlify:navigate', () => {
    if (typeof window.MakeForm?.closeSlider === 'function') {
      window.MakeForm.closeSlider();
    }
    initializeDrawer();
  });
})();
