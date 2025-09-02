import { useI18n } from '../lib/I18nContext';

function About() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('about.title')}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600 pl-4">
            {t('about.quote')}
          </blockquote>
          <p>{t('about.p4')}</p>
        </div>
      </div>
    </div>
  );
}

export default About;
