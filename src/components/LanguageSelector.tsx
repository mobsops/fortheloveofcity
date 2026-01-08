import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="terminal-box p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs text-primary tracking-widest">{t('select_language')}</span>
      </div>
      <div className="flex gap-3">
        <Button
          variant={language === 'en' ? 'terminal' : 'outline'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="flex-1"
        >
          🇬🇧 ENGLISH
        </Button>
        <Button
          variant={language === 'ru' ? 'terminal' : 'outline'}
          size="sm"
          onClick={() => setLanguage('ru')}
          className="flex-1"
        >
          🇷🇺 РУССКИЙ
        </Button>
      </div>
    </div>
  );
};
