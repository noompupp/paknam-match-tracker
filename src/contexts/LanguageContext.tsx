
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'th';

interface Translations {
  [key: string]: {
    en: string;
    th: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.latest': { en: 'Latest', th: 'ล่าสุด' },
  'nav.teams': { en: 'Teams', th: 'ทีม' },
  'nav.results': { en: 'Results', th: 'ผลการแข่งขัน' },
  'nav.fixtures': { en: 'Fixtures', th: 'การแข่งขัน' },
  'nav.referee': { en: 'Referee', th: 'กรรมการ' },
  'nav.signOut': { en: 'Sign Out', th: 'ออกจากระบบ' },
  'nav.login': { en: 'Login', th: 'เข้าสู่ระบบ' },

  // Pages
  'page.dashboard': { en: 'Dashboard', th: 'แดชบอร์ด' },
  'page.teams': { en: 'Teams', th: 'ทีม' },
  'page.results': { en: 'Results', th: 'ผลการแข่งขัน' },
  'page.fixtures': { en: 'Fixtures', th: 'การแข่งขัน' },
  'page.referee': { en: 'Referee Tools', th: 'เครื่องมือกรรมการ' },

  // Common
  'common.loading': { en: 'Loading...', th: 'กำลังโหลด...' },
  'common.error': { en: 'Error', th: 'ข้อผิดพลาด' },
  'common.noData': { en: 'No data available', th: 'ไม่มีข้อมูล' },
  'common.vs': { en: 'VS', th: 'VS' },
  'common.venue': { en: 'Venue', th: 'สถานที่' },
  'common.date': { en: 'Date', th: 'วันที่' },
  'common.time': { en: 'Time', th: 'เวลา' },
  'common.goals': { en: 'Goals', th: 'ประตู' },
  'common.assists': { en: 'Assists', th: 'แอสซิสต์' },
  'common.matches': { en: 'Matches', th: 'แมตช์' },
  'common.players': { en: 'Players', th: 'ผู้เล่น' },

  // Teams
  'teams.squad': { en: 'Squad', th: 'สควอด' },
  'teams.players': { en: 'players', th: 'ผู้เล่น' },
  'teams.viewSquad': { en: 'View Squad', th: 'ดูสควอด' },
  'teams.topScorer': { en: 'Top Scorer', th: 'นักยิงอันดับหนึ่ง' },
  'teams.topAssister': { en: 'Top Assister', th: 'ผู้แอสซิสต์อันดับหนึ่ง' },

  // Fixtures & Results
  'fixtures.upcoming': { en: 'Upcoming Fixtures', th: 'การแข่งขันที่จะมาถึง' },
  'fixtures.all': { en: 'All Fixtures', th: 'การแข่งขันทั้งหมด' },
  'fixtures.recent': { en: 'Recent Results', th: 'ผลการแข่งขันล่าสุด' },
  'fixtures.gameweek': { en: 'Gameweek', th: 'สัปดาห์การแข่งขัน' },
  'fixtures.viewDetails': { en: 'View Details', th: 'ดูรายละเอียด' },
  'fixtures.preview': { en: 'Preview', th: 'ดูตัวอย่าง' },
  'fixtures.summary': { en: 'Match Summary', th: 'สรุปการแข่งขัน' },
  'fixtures.completed': { en: 'Completed', th: 'จบแล้ว' },
  'fixtures.scheduled': { en: 'Scheduled', th: 'กำหนดการ' },
  'fixtures.live': { en: 'Live', th: 'สด' },

  // Dashboard
  'dashboard.latestResults': { en: 'Latest Results', th: 'ผลการแข่งขันล่าสุด' },
  'dashboard.upcomingFixtures': { en: 'Upcoming Fixtures', th: 'การแข่งขันที่จะมาถึง' },
  'dashboard.topScorers': { en: 'Top Scorers', th: 'นักยิงอันดับต้น' },
  'dashboard.topAssisters': { en: 'Top Assisters', th: 'ผู้แอสซิสต์อันดับต้น' },
  'dashboard.viewAll': { en: 'View All', th: 'ดูทั้งหมด' },
  'dashboard.seeAllResults': { en: 'See All Results', th: 'ดูผลการแข่งขันทั้งหมด' },
  'dashboard.seeAllFixtures': { en: 'See All Fixtures', th: 'ดูการแข่งขันทั้งหมด' },

  // Language
  'language.changeLanguage': { en: 'Change Language', th: 'เปลี่ยนภาษา' },
  'language.english': { en: 'English', th: 'อังกฤษ' },
  'language.thai': { en: 'ไทย', th: 'ไทย' },

  // Messages
  'message.signInRequired': { en: 'Please sign in to access this feature', th: 'กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้' },
  'message.connectionError': { en: 'Please check your connection and try again', th: 'กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง' },

  // Stats
  'stats.goals': { en: 'Goals', th: 'ประตู' },
  'stats.assists': { en: 'Assists', th: 'แอสซิสต์' },
  'stats.appearances': { en: 'Apps', th: 'ลงเล่น' },
  'stats.matches': { en: 'Matches', th: 'แมตช์' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
