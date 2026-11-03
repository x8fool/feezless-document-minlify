(() => {
  if (window.__feezlessMerchantWindowInstalled) return;
  window.__feezlessMerchantWindowInstalled = true;

  const merchantUrl = 'https://merchant.feezless.cloud/';
  const selector = `a[href="${merchantUrl}"], a[href="https://merchant.feezless.cloud"]`;
  const isStartButton = (link) => link && link.textContent.trim() === 'เริ่มใช้งาน';

  function prepareButton(link) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-haspopup');
  }

  function initializeStartButtons() {
    document.querySelectorAll(selector).forEach((link) => {
      if (isStartButton(link)) prepareButton(link);
    });
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!isStartButton(link)) return;
    prepareButton(link);
    window.open(merchantUrl, '_blank', 'popup,noopener,noreferrer');
    event.preventDefault();
    event.stopPropagation();
  }, true);

  initializeStartButtons();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStartButtons, { once: true });
  }
  window.addEventListener('mintlify:navigate', initializeStartButtons);
})();

(() => {
  if (window.__feezlessContactDrawerInstalled) return;
  if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  window.__feezlessContactDrawerInstalled = true;

  const bookingUrl = 'https://zcal.co/i/gFYmG_pU';
  const embedUrl = 'https://zcal.co/i/gFYmG_pU?embed=1&embedType=iframe';
  const triggerSelector = `a[href="${bookingUrl}"]:not([data-feezless-contact-fallback])`;
  let activeDrawer = null;

  function openDrawer(trigger) {
    if (activeDrawer) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'feezless-zcal-drawer';
    dialog.id = 'feezless-contact-dialog';
    dialog.setAttribute('aria-label', 'Contact Feezless');

    const header = document.createElement('div');
    header.className = 'feezless-zcal-header';
    const title = document.createElement('strong');
    title.textContent = 'Contact Feezless';
    const fallback = document.createElement('a');
    fallback.href = bookingUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.dataset.feezlessContactFallback = 'true';
    fallback.textContent = 'Open in new tab';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'feezless-zcal-close';
    closeButton.setAttribute('aria-label', 'Close contact calendar');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => dialog.close());
    header.append(title, fallback, closeButton);

    const content = document.createElement('div');
    content.className = 'feezless-zcal-content';
    const iframe = document.createElement('iframe');
    iframe.id = 'zcal-invite-drawer';
    iframe.src = embedUrl;
    iframe.title = 'Book a meeting with Feezless';
    iframe.loading = 'lazy';
    iframe.setAttribute('scrolling', 'no');
    content.append(iframe);
    dialog.append(header, content);

    const state = {
      dialog,
      trigger,
      restoreFocus: true,
      previousOverflow: document.documentElement.style.overflow
    };
    dialog.addEventListener('close', () => {
      dialog.remove();
      document.documentElement.style.overflow = state.previousOverflow;
      if (activeDrawer === state) activeDrawer = null;
      if (state.restoreFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
    }, { once: true });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });

    document.body.append(dialog);
    try {
      dialog.showModal();
    } catch (error) {
      dialog.remove();
      throw error;
    }
    activeDrawer = state;
    document.documentElement.style.overflow = 'hidden';
    closeButton.focus({ preventScroll: true });
  }

  function initializeContacts() {
    document.querySelectorAll(triggerSelector).forEach((trigger) => {
      trigger.setAttribute('aria-haspopup', 'dialog');
    });
  }

  // Delegation includes navigation menus and links added after page load.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const trigger = event.target instanceof Element ? event.target.closest(triggerSelector) : null;
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    trigger.setAttribute('aria-haspopup', 'dialog');
    try {
      openDrawer(trigger);
    } catch {
      // The normal booking URL also works without JavaScript or an embedded calendar.
      window.location.assign(bookingUrl);
    }
  }, true);

  initializeContacts();
  window.addEventListener('mintlify:navigate', () => {
    if (activeDrawer) {
      activeDrawer.restoreFocus = false;
      activeDrawer.dialog.close();
    }
    initializeContacts();
  });
})();
