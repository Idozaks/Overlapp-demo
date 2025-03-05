import { Brain, Layers } from 'react-feather';
import { useTranslation } from 'react-i18next';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {icon}
      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function FeatureSection() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8">{t('landing.ai_world.features.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <FeatureCard
          icon={<Brain className="w-12 h-12 text-primary" />}
          title={t('landing.ai_world.analysis.title')}
          description={t('landing.ai_world.analysis.description')}
        />
        <FeatureCard
          icon={<Layers className="w-12 h-12 text-primary" />}
          title={t('landing.ai_world.digital_twin.title')}
          description={t('landing.ai_world.digital_twin.description')}
        />
      </div>
    </div>
  );
}

export default FeatureSection;