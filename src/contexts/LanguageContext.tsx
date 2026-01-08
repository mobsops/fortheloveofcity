import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Welcome/Username Screen
    'title': 'TEMPORAL NEXUS',
    'subtitle': 'YEAR 2157 :: CONNECTION ESTABLISHED',
    'identity_required': 'IDENTITY VERIFICATION REQUIRED',
    'traveler_id': 'TRAVELER_ID:',
    'enter_designation': 'Enter your designation...',
    'initialize_session': 'INITIALIZE SESSION',
    'status_awaiting': 'STATUS: AWAITING_INPUT',
    'temporal_bridge': 'TEMPORAL_BRIDGE: ACTIVE',
    'select_language': 'SELECT LANGUAGE',
    
    // Dashboard
    'timeline_dashboard': 'TIMELINE DASHBOARD',
    'stability_meter': 'STABILITY',
    'timeline_nodes': 'TIMELINE NODES',
    'warning_unstable': 'TIMELINE UNSTABLE. Physical intervention required at one location to anchor reality.',
    'mission_complete': 'TIMELINE STABILIZED',
    'complete_mission': 'COMPLETE MISSION',
    'decrypted': 'DECRYPTED',
    'extracted': 'EXTRACTED',
    'locked': 'LOCKED',
    
    // Decryption Screen
    'dashboard': 'DASHBOARD',
    'agent': 'AGENT',
    'node': 'NODE',
    'decryption_phase': 'DECRYPTION PHASE',
    'the_riddle': 'THE RIDDLE:',
    'narrative_unlocked': 'NARRATIVE LINK UNLOCKED',
    'target_location': 'TARGET LOCATION',
    'enter_answer': 'Enter your answer...',
    'proceed_extraction': 'PROCEED TO EXTRACTION (+0.5 on-site)',
    'decryption_attempts': 'DECRYPTION ATTEMPTS',
    'signal_identified': 'SIGNAL IDENTIFIED! Location:',
    'points_earned': 'stability points earned.',
    'chronos_intro': 'accessing temporal node',
    'chronos_help': 'Solve the riddle to identify the location signal. I cannot reveal the answer directly, but I can help you think.',
    
    // Extraction Screen
    'extraction_phase': 'EXTRACTION PHASE',
    'location_signal': 'LOCATION SIGNAL',
    'scan_area': 'SCAN AREA',
    'scanning': 'SCANNING...',
    'field_bonus': 'FIELD BONUS',
    'extraction_complete': 'EXTRACTION COMPLETE',
    'return_dashboard': 'RETURN TO DASHBOARD',
    
    // Welcome Back
    'welcome_back': 'WELCOME BACK',
    'session_recovered': 'SESSION RECOVERED',
    'continue_mission': 'CONTINUE MISSION',
    'new_session': 'NEW SESSION',
    'progress': 'PROGRESS',
    'points': 'POINTS',
    
    // Completion
    'mission_accomplished': 'MISSION ACCOMPLISHED',
    'timeline_restored': 'TIMELINE RESTORED',
    'guardian_badge': 'GUARDIAN OF THE TIMELINE',
    
    // Admin
    'admin_console': 'ADMIN CONSOLE',
    'admin_access': 'ADMIN ACCESS',
    'auth_required': 'AUTHENTICATION REQUIRED',
    'username': 'Username',
    'password': 'Password',
    'access_console': 'ACCESS CONSOLE',
    'authenticating': 'AUTHENTICATING...',
    'total_agents': 'TOTAL AGENTS',
    'missions_complete': 'MISSIONS COMPLETE',
    'in_progress': 'IN PROGRESS',
    'agent_log': 'AGENT PROGRESS LOG',
    'loading_data': 'LOADING DATA...',
    'no_agents': 'NO AGENTS REGISTERED',
    'refresh_data': 'REFRESH DATA',
    'status': 'STATUS',
    'last_active': 'LAST ACTIVE',
    'complete': 'COMPLETE',
    'active': 'ACTIVE',
    'new': 'NEW',
  },
  ru: {
    // Welcome/Username Screen
    'title': 'ТЕМПОРАЛЬНЫЙ НЕКСУС',
    'subtitle': 'ГОД 2157 :: СОЕДИНЕНИЕ УСТАНОВЛЕНО',
    'identity_required': 'ТРЕБУЕТСЯ ВЕРИФИКАЦИЯ ЛИЧНОСТИ',
    'traveler_id': 'ID_ПУТЕШЕСТВЕННИКА:',
    'enter_designation': 'Введите ваш позывной...',
    'initialize_session': 'НАЧАТЬ СЕССИЮ',
    'status_awaiting': 'СТАТУС: ОЖИДАНИЕ_ВВОДА',
    'temporal_bridge': 'ТЕМПОРАЛЬНЫЙ_МОСТ: АКТИВЕН',
    'select_language': 'ВЫБЕРИТЕ ЯЗЫК',
    
    // Dashboard
    'timeline_dashboard': 'ПАНЕЛЬ ТАЙМЛАЙНА',
    'stability_meter': 'СТАБИЛЬНОСТЬ',
    'timeline_nodes': 'УЗЛЫ ТАЙМЛАЙНА',
    'warning_unstable': 'ТАЙМЛАЙН НЕСТАБИЛЕН. Требуется физическое вмешательство на одной из локаций.',
    'mission_complete': 'ТАЙМЛАЙН СТАБИЛИЗИРОВАН',
    'complete_mission': 'ЗАВЕРШИТЬ МИССИЮ',
    'decrypted': 'РАСШИФРОВАНО',
    'extracted': 'ИЗВЛЕЧЕНО',
    'locked': 'ЗАБЛОКИРОВАНО',
    
    // Decryption Screen
    'dashboard': 'ПАНЕЛЬ',
    'agent': 'АГЕНТ',
    'node': 'УЗЕЛ',
    'decryption_phase': 'ФАЗА ДЕШИФРОВКИ',
    'the_riddle': 'ЗАГАДКА:',
    'narrative_unlocked': 'СЮЖЕТНАЯ СВЯЗЬ РАЗБЛОКИРОВАНА',
    'target_location': 'ЦЕЛЕВАЯ ЛОКАЦИЯ',
    'enter_answer': 'Введите ваш ответ...',
    'proceed_extraction': 'ПЕРЕЙТИ К ИЗВЛЕЧЕНИЮ (+0.5 на месте)',
    'decryption_attempts': 'ПОПЫТОК ДЕШИФРОВКИ',
    'signal_identified': 'СИГНАЛ ИДЕНТИФИЦИРОВАН! Локация:',
    'points_earned': 'очков стабильности получено.',
    'chronos_intro': 'доступ к темпоральному узлу',
    'chronos_help': 'Решите загадку, чтобы определить локацию. Я не могу раскрыть ответ напрямую, но могу помочь вам думать.',
    
    // Extraction Screen
    'extraction_phase': 'ФАЗА ИЗВЛЕЧЕНИЯ',
    'location_signal': 'СИГНАЛ ЛОКАЦИИ',
    'scan_area': 'СКАНИРОВАТЬ ОБЛАСТЬ',
    'scanning': 'СКАНИРОВАНИЕ...',
    'field_bonus': 'ПОЛЕВОЙ БОНУС',
    'extraction_complete': 'ИЗВЛЕЧЕНИЕ ЗАВЕРШЕНО',
    'return_dashboard': 'ВЕРНУТЬСЯ К ПАНЕЛИ',
    
    // Welcome Back
    'welcome_back': 'С ВОЗВРАЩЕНИЕМ',
    'session_recovered': 'СЕССИЯ ВОССТАНОВЛЕНА',
    'continue_mission': 'ПРОДОЛЖИТЬ МИССИЮ',
    'new_session': 'НОВАЯ СЕССИЯ',
    'progress': 'ПРОГРЕСС',
    'points': 'ОЧКИ',
    
    // Completion
    'mission_accomplished': 'МИССИЯ ВЫПОЛНЕНА',
    'timeline_restored': 'ТАЙМЛАЙН ВОССТАНОВЛЕН',
    'guardian_badge': 'ХРАНИТЕЛЬ ТАЙМЛАЙНА',
    
    // Admin
    'admin_console': 'КОНСОЛЬ АДМИНИСТРАТОРА',
    'admin_access': 'ДОСТУП АДМИНИСТРАТОРА',
    'auth_required': 'ТРЕБУЕТСЯ АУТЕНТИФИКАЦИЯ',
    'username': 'Имя пользователя',
    'password': 'Пароль',
    'access_console': 'ВОЙТИ В КОНСОЛЬ',
    'authenticating': 'АУТЕНТИФИКАЦИЯ...',
    'total_agents': 'ВСЕГО АГЕНТОВ',
    'missions_complete': 'МИССИЙ ЗАВЕРШЕНО',
    'in_progress': 'В ПРОЦЕССЕ',
    'agent_log': 'ЛОГ ПРОГРЕССА АГЕНТОВ',
    'loading_data': 'ЗАГРУЗКА ДАННЫХ...',
    'no_agents': 'НЕТ ЗАРЕГИСТРИРОВАННЫХ АГЕНТОВ',
    'refresh_data': 'ОБНОВИТЬ ДАННЫЕ',
    'status': 'СТАТУС',
    'last_active': 'ПОСЛЕДНЯЯ АКТИВНОСТЬ',
    'complete': 'ЗАВЕРШЕНО',
    'active': 'АКТИВЕН',
    'new': 'НОВЫЙ',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('game_language');
    return (saved === 'ru' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('game_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
