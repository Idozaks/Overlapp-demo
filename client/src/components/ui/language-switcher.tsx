import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import * as flags from 'country-flag-icons/react/3x2'

const languages = [
  { code: 'en', name: 'English', flag: flags.GB },
  { code: 'he', name: 'עברית', dir: 'rtl', flag: flags.IL },
  { code: 'ar', name: 'العربية', dir: 'rtl', flag: flags.SA },
  { code: 'ru', name: 'Русский', flag: flags.RU },
  { code: 'fr', name: 'Français', flag: flags.FR },
  { code: 'es', name: 'Español', flag: flags.ES }
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
    // Update document direction for RTL languages
    const lang = languages.find(l => l.code === value)
    document.documentElement.dir = lang?.dir || 'ltr'
  }

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('common.language')} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => {
          const Flag = lang.flag
          return (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className={`flex items-center gap-2 ${lang.dir === 'rtl' ? 'text-right' : 'text-left'}`}
            >
              <Flag className="w-4 h-4" />
              {lang.name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}