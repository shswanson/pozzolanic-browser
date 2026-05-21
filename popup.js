// Pozzolanic Browser popup: per-host on/off toggles.
// Storage key is a list of host substrings the user has disabled.

(function () {
  const STORAGE_KEY = 'pozzolanic.disabled_hosts';

  function uniqueHosts() {
    return [...new Set(POZZOLANIC_RULES.map((r) => r.host))].sort();
  }

  function ruleCountFor(host) {
    return POZZOLANIC_RULES.filter((r) => r.host === host).length;
  }

  function render(disabled) {
    const container = document.getElementById('hosts');
    container.textContent = '';
    uniqueHosts().forEach((host) => {
      const row = document.createElement('div');
      row.className = 'row';

      const left = document.createElement('div');
      const name = document.createElement('span');
      name.className = 'host';
      name.textContent = host;
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = `${ruleCountFor(host)} rules`;
      left.appendChild(name);
      left.appendChild(count);

      const sw = document.createElement('label');
      sw.className = 'switch';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !disabled.includes(host);
      const slider = document.createElement('span');
      slider.className = 'slider';
      sw.appendChild(input);
      sw.appendChild(slider);

      input.addEventListener('change', () => {
        chrome.storage.local.get([STORAGE_KEY], (data) => {
          let d = data[STORAGE_KEY] || [];
          if (input.checked) {
            d = d.filter((h) => h !== host);
          } else if (!d.includes(host)) {
            d.push(host);
          }
          chrome.storage.local.set({ [STORAGE_KEY]: d });
        });
      });

      row.appendChild(left);
      row.appendChild(sw);
      container.appendChild(row);
    });
  }

  chrome.storage.local.get([STORAGE_KEY], (data) => {
    render(data[STORAGE_KEY] || []);
  });
})();
