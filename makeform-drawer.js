(() => {
  if (window.__feezlessMakeformDrawerInstalled) return;
  window.__feezlessMakeformDrawerInstalled = true;

  const formUrl = 'https://makeform.ai/e/iY978F0d?__mf_modal_embed=1';
  const formId = 'iY978F0d';
  const sdkUrl = 'https://www.makeform.ai/widgets/embed.js';
  const triggerSelector = `a[href="${formUrl}"]:not([data-feezless-contact-fallback])`;
  let sdkPromise;
  let pendingOpen = null;

  function loadSdk() {
    if (typeof window.MakeForm?.openSlider === 'function') {
      return Promise.resolve(window.MakeForm);
    }
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${sdkUrl}"]`);
      const isNew = !script;
      if (isNew) {
        script = document.createElement('script');
        script.id = 'feezless-makeform-sdk';
        script.src = sdkUrl;
        script.async = true;
      }

      const timeout = window.setTimeout(onError, 12000);
      function cleanup() {
        window.clearTimeout(timeout);
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
      }
      function onLoad() {
        if (typeof window.MakeForm?.openSlider !== 'function') {
          onError();
          return;
        }
        cleanup();
        resolve(window.MakeForm);
      }
      function onError() {
        cleanup();
        if (script.id === 'feezless-makeform-sdk') script.remove();
        reject(new Error('Makeform could not be loaded'));
      }

      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', onError, { once: true });
      if (isNew) document.head.appendChild(script);
    }).catch((error) => {
      sdkPromise = null;
      throw error;
    });
    return sdkPromise;
  }

  function initializeContacts() {
    const triggers = document.querySelectorAll(triggerSelector);
    triggers.forEach((trigger) => trigger.setAttribute('aria-haspopup', 'dialog'));
    if (triggers.length) loadSdk().catch(() => {});
  }

  // Delegation also covers links in menus mounted after the initial page render.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const trigger = event.target instanceof Element ? event.target.closest(triggerSelector) : null;
    if (!trigger) return;

    event.preventDefault();
    event.stopPropagation();
    if (pendingOpen) return;

    const request = { trigger };
    pendingOpen = request;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-busy', 'true');

    loadSdk().then((sdk) => {
      if (pendingOpen !== request) return;
      sdk.openSlider(formId, {
        embedUrl: formUrl,
        width: 400,
        initialBgColor: 'Canvas',
        onOpen: () => {
          const dialog = document.querySelector('.makeform-slider-modal');
          if (!dialog) return;
          dialog.setAttribute('role', 'dialog');
          dialog.setAttribute('aria-modal', 'true');
          dialog.setAttribute('aria-label', 'Feezless');
          dialog.querySelector('button')?.focus({ preventScroll: true });
        },
        onClose: () => {
          if (trigger.isConnected) trigger.focus({ preventScroll: true });
        }
      });
    }).catch(() => {
      // Keep the form reachable when the embed SDK is unavailable.
      if (pendingOpen === request) window.location.assign(formUrl);
    }).finally(() => {
      trigger.removeAttribute('aria-busy');
      if (pendingOpen === request) pendingOpen = null;
    });
  }, true);

  initializeContacts();
  window.addEventListener('mintlify:navigate', () => {
    if (pendingOpen) pendingOpen.trigger.removeAttribute('aria-busy');
    pendingOpen = null;
    if (typeof window.MakeForm?.closeSlider === 'function') window.MakeForm.closeSlider();
    initializeContacts();
  });
})();
