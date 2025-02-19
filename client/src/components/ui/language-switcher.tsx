import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

const languages = [
  { code: 'en', name: 'English' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Русский' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t('common.language')} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className={lang.dir === 'rtl' ? 'text-right' : 'text-left'}
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
