function getBrowserLang() {
  const storedLang = localStorage.getItem('language');
  if (storedLang) return storedLang;

  const browserLang = navigator.language.split('-')[0];
  return supportedLngs.includes(browserLang) ? browserLang : 'he';
}