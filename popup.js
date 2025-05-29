document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.getElementById('exportTabs');
  const openButton = document.getElementById('openLinks');
  const statusDiv = document.getElementById('status');

  if (exportButton) {
    exportButton.addEventListener('click', () => {
      exportButton.disabled = true;
      statusDiv.textContent = "Exporting tabs...";
      browser.runtime.sendMessage({ action: 'exportTabs' })
        .then((response) => {
          if (response && response.success) {
            statusDiv.textContent = "Tabs exported!";
          } else {
            statusDiv.textContent = "Export failed!";
          }
        })
        .catch(() => {
          statusDiv.textContent = "Export failed!";
        })
        .finally(() => {
          exportButton.disabled = false;
          setTimeout(() => statusDiv.textContent = "", 2000);
        });
    });
  }

  if (openButton) {
    openButton.addEventListener('click', () => {
      browser.runtime.sendMessage({ action: 'openLinks' });
    });
  }
});
