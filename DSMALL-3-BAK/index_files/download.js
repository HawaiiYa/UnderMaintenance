const ensureOverlay = () => {
  let overlay = document.querySelector('.download-overlay');
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.className = 'download-overlay';
  overlay.innerHTML = `
    <div class="progress-shell">
      <svg class="progress-ring" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
        <circle class="progress-ring__bg" cx="70" cy="70" r="54"></circle>
        <circle class="progress-ring__value" cx="70" cy="70" r="54"></circle>
      </svg>
      <div class="progress-percent">0%</div>
      <div class="progress-check" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <path d="M12 25l8 8 16-18" fill="none" stroke="#7ce38b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
};

const setProgress = (overlay, percent) => {
  const valueCircle = overlay.querySelector('.progress-ring__value');
  const percentText = overlay.querySelector('.progress-percent');
  const radius = valueCircle.r && valueCircle.r.baseVal
    ? valueCircle.r.baseVal.value
    : parseFloat(valueCircle.getAttribute('r'));
  const circumference = 2 * Math.PI * radius;

  if (!valueCircle.dataset.circumference) {
    valueCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    valueCircle.dataset.circumference = String(circumference);
  }

  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;
  valueCircle.style.strokeDashoffset = `${offset}`;
  percentText.textContent = `${clamped}%`;
};

const showOverlay = (overlay) => {
  overlay.classList.add('is-visible');
  overlay.classList.remove('is-complete');
};

const hideOverlay = (overlay) => {
  overlay.classList.remove('is-visible');
  overlay.classList.remove('is-complete');
};

const completeOverlay = (overlay) => {
  overlay.classList.add('is-complete');
  setTimeout(() => {
    hideOverlay(overlay);
    setProgress(overlay, 0);
  }, 900);
};

const downloadWithProgress = async (downloadLink) => {
  const fileUrl = downloadLink.href;
  const fileName = downloadLink.dataset.filename || 'download.apk';
  const overlay = ensureOverlay();

  showOverlay(overlay);
  setProgress(overlay, 0);

  try {
    const response = await fetch(fileUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('web error');
    }

    if (!response.body || !response.body.getReader) {
      const blob = await response.blob();
      setProgress(overlay, 100);
      completeOverlay(overlay);
      return triggerDownload(blob, fileName);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    const reader = response.body.getReader();
    let receivedBytes = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedBytes += value.length;

      if (totalBytes > 0) {
        const percent = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
        setProgress(overlay, percent);
      }
    }

    const blob = new Blob(chunks);
    setProgress(overlay, 100);
    completeOverlay(overlay);
    triggerDownload(blob, fileName);
  } catch (error) {
    console.error('error:', error);
    hideOverlay(overlay);
    alert('download error!');
  }
};

const triggerDownload = (blob, fileName) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobUrl;
  tempLink.setAttribute('download', fileName);

  document.body.appendChild(tempLink);
  tempLink.click();

  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(blobUrl);
};

const bindDownloadLink = (downloadLink) => {
  if (!downloadLink) {
    return;
  }

  downloadLink.addEventListener('click', (event) => {
    event.preventDefault();
    downloadWithProgress(downloadLink);
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const downloadLinks = document.querySelectorAll('.download-link-apk');
  downloadLinks.forEach(bindDownloadLink);
});
