// The PixiJS front page that was live until 18 October 2026 loaded this file. Browsers that still
// have that page cached ask for it, and it reloads them once to fetch the current page instead.
// It can be deleted from December 2026, when no browser will still treat that page as fresh.
try {
  if (!sessionStorage.getItem("lh:old-page-reloaded")) {
    sessionStorage.setItem("lh:old-page-reloaded", "1");
    location.reload();
  }
} catch {
  // Without storage, a reload cannot be guarded against looping, so the page is left as it is.
}
