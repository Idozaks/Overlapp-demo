import { useTranslation } from 'react-i18next'

interface FeatureCardProps {
  icon: React.ReactNode;
  titleKey: string; // Changed to key
  descriptionKey: string; // Changed to key
}

export function FeatureCard({ icon, titleKey, descriptionKey }: FeatureCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold mb-2">{t(titleKey)}</h3> {/* Use t() for translation */}
      <p className="text-muted-foreground">{t(descriptionKey)}</p> {/* Use t() for translation */}
    </div>
  );
}