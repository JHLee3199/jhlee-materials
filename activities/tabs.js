(() => {
  const tabList = document.querySelector('.activity-tabs');
  if (!tabList) return;

  const tabs = Array.from(tabList.querySelectorAll('a[href^="#"]'));
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
  if (!tabs.length || panels.some(panel => !panel)) return;

  function showTab(selected) {
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
  }

  function syncLocation() {
    const selected = tabs.find(tab => tab.hash === location.hash) || tabs[0];
    const focus = document.activeElement;
    const focusInTabs = tabList.contains(focus);
    const focusInOtherPanel = panels.some((panel, i) => tabs[i] !== selected && panel.contains(focus));
    showTab(selected);
    if (focusInTabs || focusInOtherPanel) selected.focus({ preventScroll: true });
  }

  function select(tab) {
    if (location.hash !== tab.hash) history.pushState(null, '', tab.hash);
    showTab(tab);
    tab.focus({ preventScroll: true });
  }

  tabList.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.id = 'tab-' + panel.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tab.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(tab);
    });

    tab.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      let next;
      switch (event.key) {
        case 'ArrowLeft': next = (index - 1 + tabs.length) % tabs.length; break;
        case 'ArrowRight': next = (index + 1) % tabs.length; break;
        case 'Home': next = 0; break;
        case 'End': next = tabs.length - 1; break;
        case ' ': next = index; break;
        default: return;
      }
      event.preventDefault();
      select(tabs[next]);
    });
  });

  syncLocation();
  window.addEventListener('popstate', syncLocation);
  window.addEventListener('hashchange', syncLocation);
})();
