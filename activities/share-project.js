(() => {
  if (!navigator.clipboard?.writeText) return;

  for (const button of document.querySelectorAll('button[data-copy-project]')) {
    const entry = button.closest('li');
    const link = entry?.querySelector('a[href]');
    const status = entry?.querySelector('.project-share-status');
    if (!link || !status) continue;

    button.hidden = false;
    let copying = false;
    button.addEventListener('click', async () => {
      if (copying) return;
      copying = true;
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(link.href);
        status.textContent = 'Link copied.';
      } catch {
        status.textContent = `Select and copy ${link.href}`;
      } finally {
        copying = false;
      }
    });
  }
})();
