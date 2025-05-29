browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportTabs') {
    exportTabs()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true; // sendResponse is called asynchronously
  } else if (request.action === 'openLinks') {
    openLinks();
    sendResponse({ success: true });
    return true;
  }
});

function exportTabs() {
  return browser.windows.getLastFocused({ populate: true })
    .then(currentWindow => {
      const tabs = currentWindow.tabs;
      const htmlContent = createHtmlContent(tabs);
      return triggerDownload(htmlContent);
    })
    .catch(error => {
      console.error("Tab export failed:", error);
      throw error;
    });
}

function createHtmlContent(tabs) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8"><title>Saved Tabs</title></head>
  <body>
    ${tabs.map(tab => `<a href="${tab.url}" target="_blank">${tab.title}</a>`).join('<br>\n')}
  </body>
</html>`;
}

function triggerDownload(content) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `Tab2Links_${dateStr}.html`;

    browser.downloads.download({
      url: url,
      filename: filename,
      conflictAction: 'uniquify'
    }).then(() => {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve();
    }).catch((error) => {
      console.error("Download error:", error);
      reject(error);
    });
  });
}

function openLinks() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.executeScript(tabs[0].id, {
      code: `
        (function() {
          try {
            const links = Array.from(document.querySelectorAll('a'));
            // Open links in order (top to bottom)
            links.forEach((link, index) => {
              setTimeout(() => {
                window.open(link.href, '_blank');
              }, index * 100);
            });
          } catch (error) {
            console.error('Link opening error:', error);
          }
        })();
      `
    });
  });
}
