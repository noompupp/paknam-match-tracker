
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation dictionary
const translations = {
  en: {
    // Navigation
    'nav.latest': 'Latest',
    'nav.teams': 'Teams',
    'nav.results': 'Results',
    'nav.fixtures': 'Fixtures',
    'nav.referee': 'Referee',
    'nav.login': 'Login',
    'nav.signOut': 'Sign out',
    
    // Common actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.view': 'View',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Page titles
    'page.dashboard': 'Dashboard',
    'page.teams': 'Teams',
    'page.results': 'Results',
    'page.fixtures': 'Fixtures',
    'page.referee': 'Referee Tools',
    
    // Dashboard
    'dashboard.leagueTable': 'League Table',
    'dashboard.topScorers': 'Top Scorers',
    'dashboard.topAssists': 'Top Assists',
    'dashboard.recentResults': 'Recent Results',
    'dashboard.upcomingFixtures': 'Upcoming Fixtures',
    'dashboard.viewAll': 'View All',
    'dashboard.noData': 'No data available',
    
    // Teams
    'teams.squad': 'Squad',
    'teams.players': 'players',
    'teams.viewSquad': 'View Squad',
    'teams.playerCount': '{count} players',
    
    // Match status
    'match.completed': 'Completed',
    'match.live': 'Live',
    'match.scheduled': 'Scheduled',
    'match.fullTime': 'Full Time',
    'match.vs': 'VS',
    
    // Referee tools
    'referee.selectMatch': 'Select Match',
    'referee.matchTimer': 'Match Timer',
    'referee.score': 'Score',
    'referee.timerTracking': 'Timer & Tracking',
    'referee.cards': 'Cards',
    'referee.summary': 'Summary',
    'referee.start': 'Start',
    'referee.pause': 'Pause',
    'referee.resume': 'Resume',
    'referee.reset': 'Reset',
    'referee.saveMatch': 'Save Match',
    
    // Match events
    'event.goal': 'Goal',
    'event.assist': 'Assist',
    'event.yellowCard': 'Yellow Card',
    'event.redCard': 'Red Card',
    'event.substitution': 'Substitution',
    
    // Forms
    'form.selectPlayer': 'Select Player',
    'form.selectTeam': 'Select Team',
    'form.matchTime': 'Match Time',
    'form.required': 'This field is required',
    
    // Time
    'time.minute': 'min',
    'time.minutes': 'minutes',
    'time.halfTime': 'Half Time',
    'time.firstHalf': '1st Half',
    'time.secondHalf': '2nd Half',
    'time.overtime': 'Overtime',
    
    // Messages
    'message.signInRequired': 'Please sign in to access this feature',
    'message.matchSaved': 'Match data saved successfully',
    'message.matchReset': 'Match has been reset',
    'message.playerAdded': 'Player added to tracking',
    'message.playerRemoved': 'Player removed from tracking',
    
    // Language
    'language.english': 'English',
    'language.thai': 'ไทย',
    'language.changeLanguage': 'Change language'
  },
  th: {
    // Navigation
    'nav.latest': 'ล่าสุด',
    'nav.teams': 'ทีม',
    'nav.results': 'ผลการแข่งขัน',
    'nav.fixtures': 'ตารางแข่งขัน',
    'nav.referee': 'ผู้ตัดสิน',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.signOut': 'ออกจากระบบ',
    
    // Common actions
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.edit': 'แก้ไข',
    'common.delete': 'ลบ',
    'common.add': 'เพิ่ม',
    'common.remove': 'ลบออก',
    'common.view': 'ดู',
    'common.close': 'ปิด',
    'common.loading': 'กำลังโหลด...',
    'common.error': 'ข้อผิดพลาด',
    'common.success': 'สำเร็จ',
    
    // Page titles
    'page.dashboard': 'แดชบอร์ด',
    'page.teams': 'ทีม',
    'page.results': 'ผลการแข่งขัน',
    'page.fixtures': 'ตารางแข่งขัน',
    'page.referee': 'เครื่องมือผู้ตัดสิน',
    
    // Dashboard
    'dashboard.leagueTable': 'ตารางลีก',
    'dashboard.topScorers': 'นักเตะทำประตูสูงสุด',
    'dashboard.topAssists': 'นักเตะแอสซิสต์สูงสุด',
    'dashboard.recentResults': 'ผลการแข่งขันล่าสุด',
    'dashboard.upcomingFixtures': 'การแข่งขันที่จะมาถึง',
    'dashboard.viewAll': 'ดูทั้งหมด',
    'dashboard.noData': 'ไม่มีข้อมูล',
    
    // Teams
    'teams.squad': 'ทีม',
    'teams.players': 'นักเตะ',
    'teams.viewSquad': 'ดูทีม',
    'teams.playerCount': '{count} นักเตะ',
    
    // Match status
    'match.completed': 'เสร็จสิ้น',
    'match.live': 'สด',
    'match.scheduled': 'กำหนดการ',
    'match.fullTime': 'จบเกม',
    'match.vs': 'VS',
    
    // Referee tools
    'referee.selectMatch': 'เลือกแมตช์',
    'referee.matchTimer': 'ตัวจับเวลาแมตช์',
    'referee.score': 'คะแนน',
    'referee.timerTracking': 'ตัวจับเวลาและการติดตาม',
    'referee.cards': 'การ์ด',
    'referee.summary': 'สรุป',
    'referee.start': 'เริ่ม',
    'referee.pause': 'หยุดชั่วคราว',
    'referee.resume': 'ดำเนินต่อ',
    'referee.reset': 'รีเซ็ต',
    'referee.saveMatch': 'บันทึกแมตช์',
    
    // Match events
    'event.goal': 'ประตู',
    'event.assist': 'แอสซิสต์',
    'event.yellowCard': 'ใบเหลือง',
    'event.redCard': 'ใบแดง',
    'event.substitution': 'เปลี่ยนตัว',
    
    // Forms
    'form.selectPlayer': 'เลือกนักเตะ',
    'form.selectTeam': 'เลือกทีม',
    'form.matchTime': 'เวลาแมตช์',
    'form.required': 'ฟิลด์นี้จำเป็น',
    
    // Time
    'time.minute': 'นาที',
    'time.minutes': 'นาที',
    'time.halfTime': 'ครึ่งเวลา',
    'time.firstHalf': 'ครึ่งแรก',
    'time.secondHalf': 'ครึ่งหลัง',
    'time.overtime': 'เวลาพิเศษ',
    
    // Messages
    'message.signInRequired': 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงฟีเจอร์นี้',
    'message.matchSaved': 'บันทึกข้อมูลแมตช์เรียบร้อยแล้ว',
    'message.matchReset': 'รีเซ็ตแมตช์แล้ว',
    'message.playerAdded': 'เพิ่มนักเตะในการติดตามแล้ว',
    'message.playerRemoved': 'ลบนักเตะออกจากการติดตามแล้ว',
    
    // Language
    'language.english': 'English',
    'language.thai': 'ไทย',
    'language.changeLanguage': 'เปลี่ยนภาษา'
  }
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language preference from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key];
    if (translation) {
      return translation;
    }
    
    // If no translation found, try English as fallback
    if (language !== 'en') {
      const englishTranslation = translations.en[key];
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    
    // If still no translation, return fallback or the key itself
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
