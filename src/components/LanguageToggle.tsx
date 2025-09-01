import { useI18n } from '../lib/I18nContext';

function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="inline-flex items-center rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 text-sm ${
          lang === 'en'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-pressed={lang === 'en'}
      >
        {t('lang.en')}
      </button>
      <button
        onClick={() => setLang('zh-TW')}
        className={`px-2 py-1 text-sm ${
          lang === 'zh-TW'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-pressed={lang === 'zh-TW'}
      >
        {t('lang.zh')}
      </button>
    </div>
  );
}

export default LanguageToggle;

