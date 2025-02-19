import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import * as flags from 'country-flag-icons/react/3x2'
import { useEffect } from "react"

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
    const lang = languages.find(l => l.code === value)
    document.documentElement.dir = lang?.dir || 'ltr'
    document.documentElement.lang = value
    i18n.changeLanguage(value)
  }

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          {(() => {
            const currentLang = languages.find(l => l.code === i18n.language)
            const Flag = currentLang?.flag
            return (
              <div className="flex items-center gap-2">
                {Flag && <Flag className="w-4 h-4" />}
                <span>{currentLang?.name}</span>
              </div>
            )
          })()}
        </SelectValue>
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