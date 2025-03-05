function getBrowserLang() {
  const storedLang = localStorage.getItem('language');
  if (storedLang) return storedLang;

  // Always use Hebrew as default language
  return 'he';
}