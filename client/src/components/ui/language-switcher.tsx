import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import * as flags from 'country-flag-icons/react/3x2'
import { useEffect, useState } from "react"
import { isRTL } from "@/lib/i18n"

// Comprehensive language definitions
const languages = [
  { code: 'en', name: 'English', localName: 'English', flag: flags.GB, dir: 'ltr' },
  { code: 'he', name: 'Hebrew', localName: 'עברית', flag: flags.IL, dir: 'rtl' },
  { code: 'ar', name: 'Arabic', localName: 'العربية', flag: flags.SA, dir: 'rtl' },
  { code: 'ru', name: 'Russian', localName: 'Русский', flag: flags.RU, dir: 'ltr' },
  { code: 'fr', name: 'French', localName: 'Français', flag: flags.FR, dir: 'ltr' },
  { code: 'es', name: 'Spanish', localName: 'Español', flag: flags.ES, dir: 'ltr' }
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  
  // Handle initial mount to ensure we properly set the language from localStorage
  useEffect(() => {
    setMounted(true)
    // When component mounts, ensure document direction matches the current language
    const currentLang = languages.find(l => l.code === i18n.language)
    if (currentLang) {
      document.documentElement.dir = currentLang.dir
      document.documentElement.lang = currentLang.code
      
      // Add RTL class if needed
      if (isRTL(currentLang.code)) {
        document.documentElement.classList.add('rtl-layout')
      } else {
        document.documentElement.classList.remove('rtl-layout')
      }
    }
  }, [])

  const handleLanguageChange = (value: string) => {
    const lang = languages.find(l => l.code === value)
    if (!lang) return
    
    // Update document direction and language
    document.documentElement.dir = lang.dir
    document.documentElement.lang = value
    
    // Update RTL class
    if (isRTL(lang.code)) {
      document.documentElement.classList.add('rtl-layout')
    } else {
      document.documentElement.classList.remove('rtl-layout')
    }
    
    // Change language in i18n
    i18n.changeLanguage(value)
    
    // Save preference to localStorage
    localStorage.setItem('i18nextLng', value)
  }

  // If not mounted yet, show a simple placeholder
  if (!mounted) return <div className="w-[180px] h-10 rounded-md bg-muted animate-pulse" />

  // Get current language
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]
  const Flag = currentLang.flag

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]" aria-label={t('common.language')}>
        <SelectValue>
          <div className={`flex items-center gap-2 ${isRTL(i18n.language) ? 'flex-row-reverse' : ''}`}>
            <Flag className="w-4 h-4" />
            <span className={isRTL(i18n.language) ? 'font-hebrew' : ''}>{currentLang.localName}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => {
          const Flag = lang.flag
          const isRtl = lang.dir === 'rtl'
          
          return (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              data-lang={lang.code}
              className={`lang-item flex items-center gap-2 ${isRtl ? 'text-right font-hebrew justify-end' : 'text-left'}`}
            >
              <div className={`flex items-center gap-2 w-full ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Flag className="w-4 h-4 flex-shrink-0" />
                <span className={isRtl ? 'font-hebrew' : ''}>
                  {lang.localName}
                </span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}