const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
let resumeReady = false;

function activateTab(tab, moveFocus = false) {
  const targetId = tab.getAttribute('aria-controls');

  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-selected', isActive);
    item.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.id !== targetId;
    panel.classList.toggle('is-visible', panel.id === targetId);
  });

  if (targetId === 'panel-resume' && !resumeReady) loadResumeViewer();

  if (moveFocus) tab.focus();
}

async function loadResumeViewer() {
  resumeReady = true;
  const status = document.querySelector('#pdf-status');
  const viewer = document.querySelector('.pdf-viewer');
  if (window.location.protocol === 'file:') {
    viewer.classList.add('pdf-viewer--fallback');
    status.textContent = 'Using the browser PDF preview for local files.';
    return;
  }
  try {
    if (!window.pdfjsLib) throw new Error('PDF.js did not load');
    const pdfjs = window.pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await pdfjs.getDocument('MaxBov_Resume_june.pdf').promise;
    const canvas = document.querySelector('#pdf-canvas');
    const context = canvas.getContext('2d');
    const pageLabel = document.querySelector('#pdf-page');
    const pagesLabel = document.querySelector('#pdf-pages');
    const previous = document.querySelector('#pdf-prev');
    const next = document.querySelector('#pdf-next');
    let pageNumber = 1;
    let scale = 1.15;
    pagesLabel.textContent = pdf.numPages;

    async function renderPage() {
      const page = await pdf.getPage(pageNumber);
      const availableWidth = document.querySelector('.pdf-canvas-wrap').clientWidth - 68;
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = availableWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: Math.max(.5, fitScale * scale) });
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      await page.render({ canvasContext: context, viewport, transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null }).promise;
      pageLabel.textContent = pageNumber;
      previous.disabled = pageNumber === 1;
      next.disabled = pageNumber === pdf.numPages;
      status.textContent = 'Use the controls to browse the resume.';
    }

    previous.addEventListener('click', () => { if (pageNumber > 1) { pageNumber -= 1; renderPage(); } });
    next.addEventListener('click', () => { if (pageNumber < pdf.numPages) { pageNumber += 1; renderPage(); } });
    document.querySelector('#pdf-zoom-out').addEventListener('click', () => { scale = Math.max(.8, scale - .15); renderPage(); });
    document.querySelector('#pdf-zoom-in').addEventListener('click', () => { scale = Math.min(2, scale + .15); renderPage(); });
    window.addEventListener('resize', renderPage);
    await renderPage();
  } catch (error) {
    viewer.classList.add('pdf-viewer--fallback');
    status.textContent = 'Preview unavailable. Use the download link below.';
    console.error('Resume preview failed:', error);
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
    activateTab(nextTab, true);
  });
});

const contactDialog = document.querySelector('#contact-dialog');
const openContact = document.querySelector('#open-contact');
const closeContact = document.querySelector('#close-contact');
const bookCall = document.querySelector('[data-book-call]');
let lastFocusedElement;

function closeDialog() {
  contactDialog.hidden = true;
  document.body.classList.remove('dialog-open');
  lastFocusedElement?.focus();
}

openContact.addEventListener('click', () => {
  lastFocusedElement = document.activeElement;
  contactDialog.hidden = false;
  document.body.classList.add('dialog-open');
  closeContact.focus();
});

closeContact.addEventListener('click', closeDialog);
contactDialog.addEventListener('click', (event) => {
  if (event.target === contactDialog) closeDialog();
});

bookCall.addEventListener('click', () => {
  const contactTab = document.querySelector('#tab-contact');
  activateTab(contactTab);
  closeDialog();
  document.querySelector('#panel-contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !contactDialog.hidden) closeDialog();
});
