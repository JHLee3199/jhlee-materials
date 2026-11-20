(() => {
  const navigation = document.querySelector('.activity-tabs');
  if (!navigation) return;

  const links = Array.from(navigation.querySelectorAll('a[href]'));
  const sections = [];
  for (const link of navigation.querySelectorAll('a[href^="#"]')) {
    const panel = document.getElementById(link.hash.slice(1));
    if (panel) sections.push({ link, panel });
  }

  function showSection(selected) {
    const focused = document.activeElement;
    for (const { link, panel } of sections) {
      const active = panel === selected.panel;
      if (!active && panel.contains(focused)) selected.link.focus({ preventScroll: true });
      panel.hidden = !active;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function syncLocation() {
    if (!sections.length) return;
    const target = document.getElementById(location.hash.slice(1));
    if (location.hash === '#hobbies' && navigation.contains(target)) {
      location.replace(target.href);
      return;
    }
    const selected = sections.find(({ panel }) => panel.contains(target)) || sections[0];
    showSection(selected);
  }

  function closeAlbums() {
    for (const album of document.querySelectorAll('#hobbies .hobby-album details[open]')) {
      album.open = false;
    }
  }

  for (const section of sections) {
    section.link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== section.link.hash) history.pushState(null, '', section.link.hash);
      showSection(section);
      section.link.focus({ preventScroll: true });
    });
  }

  links.forEach((link, index) => {
    link.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      let next;
      switch (event.key) {
        case 'ArrowLeft': next = (index - 1 + links.length) % links.length; break;
        case 'ArrowRight': next = (index + 1) % links.length; break;
        case 'Home': next = 0; break;
        case 'End': next = links.length - 1; break;
        case ' ':
          event.preventDefault();
          if (!event.repeat) link.click();
          return;
        default: return;
      }
      event.preventDefault();
      links[next].focus();
    });
  });

  syncLocation();
  closeAlbums();
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    syncLocation();
    closeAlbums();
  });
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
})();
