import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-16 z-50 gap-2 text-xs font-mono tracking-wider opacity-70 hover:opacity-100 transition-opacity"
    >
      <Globe className="w-4 h-4" />
      {language === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
    </Button>
  );
};
