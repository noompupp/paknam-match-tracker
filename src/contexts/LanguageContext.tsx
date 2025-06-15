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
    'referee.title': 'Referee Tools',
    'referee.subtitle': 'Manage match events and player statistics',
    'referee.cardsManagement': 'Cards Management',
    'referee.scoreManagement': 'Score Management',
    'referee.timeTracking': 'Time Tracking',
    'referee.matchSummary': 'Match Summary',
    'referee.ready': 'Ready',
    'referee.issues': 'Issues',
    'referee.save': 'Save Now',
    'referee.saving': 'Saving...',
    'referee.export': 'Export',
    'referee.cardsAutoSaveEnhanced': 'Cards Auto-Save Enhanced',
    'referee.cardsAutoSaveTip': 'Card changes are automatically saved every 3 minutes with improved database sync.',
    'referee.loadingFixtures': 'Loading fixtures...',
    'referee.matchSelection': 'Select Match',
    'referee.homeTeam': 'Home Team',
    'referee.awayTeam': 'Away Team',
    'referee.cancel': 'Cancel',
    // Tab labels
    'referee.tab.timer': 'Timer',
    'referee.tab.score': 'Score',
    'referee.tab.cards': 'Cards',
    'referee.tab.summary': 'Summary',
    
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
    'language.changeLanguage': 'Change language',

    // Referee tools (expanding with missing keys for warnings, quick actions, summary etc)
    'referee.noMatchSelected': 'No Match Selected',
    'referee.selectMatchTooltip': 'Select a match to access referee controls',
    'referee.quickActions': 'Quick Actions',
    'referee.quickGoals': 'Quick Goals',
    'referee.matchData': 'Match Data',
    'referee.unsavedChanges': 'Unsaved Changes',
    'referee.completed': 'Completed',
    'referee.live': 'Live',
    'referee.paused': 'Paused',
    'referee.start': 'Start',
    'referee.pause': 'Pause',
    'referee.reset': 'Reset',
    'referee.scheduled': 'Scheduled',
    'referee.scored': 'Scored',
    'referee.dataReady': 'Data Ready',
    'referee.dataIssues': 'Data Issues',
    'referee.matchTeamsVs': '{home} vs {away}',
    'referee.playerTimeTracking': 'Player Time Tracking',
    'referee.noPlayersTracked': 'No players are being tracked',
    'referee.players': '{count} players',
    'referee.totalMinutes': '{count} total minutes',
    // Warnings
    'referee.sevenPlayerLimitExceeded': '7-Player Limit Exceeded!',
    'referee.currentPlayersOnField': 'Currently {count} players on field.',
    'referee.limit': 'LIMIT EXCEEDED',
    'referee.approachingLimit': 'APPROACHING LIMIT',
    'referee.sClassHalfLimit': 'S-Class players are limited to 20 minutes per half',

    'referee.saveAll': 'Save All',
    'referee.exportSummary': 'Export',
    'referee.goal': '{count} goal',
    'referee.goals': '{count} goals',
    'referee.card': '{count} card',
    'referee.cards': '{count} cards',
    'referee.playerTime': '{count} player time',
    'referee.playerTimes': '{count} player times',
    'referee.unsaved': '{count} unsaved',

    'referee.chooseMatchPlaceholder': 'Choose a match to manage...',
    'referee.selectFixture': 'Select Fixture',
    'referee.matchSelectionTitle': 'Match Selection',
    
    // 7-a-side validation & alerts
    'referee.rulesClear': '7-a-Side Rules: All Clear',
    'referee.onField': '{count}/{limit} on field',
    'referee.currentHalf': 'Half {half} - {time}',
    'referee.playersOnField': 'Players on Field',
    'referee.totalTracked': 'Total Tracked',
    'referee.criticalViolations': 'CRITICAL RULE VIOLATIONS DETECTED',
    'referee.immediateAction': 'IMMEDIATE ACTION REQUIRED',
    'referee.exceededLimit': 'LIMIT EXCEEDED',
    'referee.approachingLimit': 'APPROACHING LIMIT',
    'referee.needsMoreTime': 'NEEDS MORE TIME',
    'referee.allClear': 'All Clear',
    'referee.substituteNow': 'MUST SUBSTITUTE NOW',
    'referee.mustSubstitute': 'S-Class players are limited to 20 minutes per half - MUST SUBSTITUTE NOW',
    'referee.needsMoreToReachMinimum': 'Needs {time} more to reach minimum',
    'referee.playersOnFieldLabel': 'Players on Field',
    'referee.totalTrackedLabel': 'Total Tracked',
    'referee.time': '{time}',
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
    'referee.title': 'เครื่องมือผู้ตัดสิน',
    'referee.subtitle': 'จัดการเหตุการณ์และสถิตินักเตะในการแข่งขัน',
    'referee.cardsManagement': 'จัดการใบเหลืองใบแดง',
    'referee.scoreManagement': 'จัดการคะแนน',
    'referee.timeTracking': 'ติดตามเวลา',
    'referee.matchSummary': 'สรุปการแข่งขัน',
    'referee.ready': 'พร้อม',
    'referee.issues': 'ปัญหา',
    'referee.save': 'บันทึกทันที',
    'referee.saving': 'กำลังบันทึก...',
    'referee.export': 'ส่งออก',
    'referee.cardsAutoSaveEnhanced': 'การบันทึกใบเหลืองใบแดงอัตโนมัติ (ขั้นสูง)',
    'referee.cardsAutoSaveTip': 'มีการบันทึกข้อมูลใบเหลืองใบแดงอัตโนมัติทุก 3 นาทีและซิงค์กับฐานข้อมูล',
    'referee.loadingFixtures': 'กำลังโหลดข้อมูลการแข่งขัน...',
    'referee.matchSelection': 'เลือกแมตช์',
    'referee.homeTeam': 'ทีมเหย้า',
    'referee.awayTeam': 'ทีมเยือน',
    'referee.cancel': 'ยกเลิก',
    // Tab labels
    'referee.tab.timer': 'จับเวลา',
    'referee.tab.score': 'คะแนน',
    'referee.tab.cards': 'ใบเหลือง-แดง',
    'referee.tab.summary': 'สรุป',
    
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
    'language.changeLanguage': 'เปลี่ยนภาษา',

    // Referee tools (expand with all missing keys, based on English list above)
    'referee.noMatchSelected': 'ยังไม่ได้เลือกแมตช์',
    'referee.selectMatchTooltip': 'เลือกแมตช์เพื่อใช้งานเครื่องมือผู้ตัดสิน',
    'referee.quickActions': 'ทางลัด',
    'referee.quickGoals': 'เพิ่มประตูด่วน',
    'referee.matchData': 'ข้อมูลการแข่งขัน',
    'referee.unsavedChanges': 'ข้อมูลยังไม่ได้บันทึก',
    'referee.completed': 'เสร็จสิ้น',
    'referee.live': 'กำลังแข่ง',
    'referee.paused': 'หยุดชั่วคราว',
    'referee.start': 'เริ่ม',
    'referee.pause': 'หยุด',
    'referee.reset': 'รีเซ็ต',
    'referee.scheduled': 'กำหนดการ',
    'referee.scored': 'มีคะแนน',
    'referee.dataReady': 'ข้อมูลถูกต้อง',
    'referee.dataIssues': 'ข้อมูลมีปัญหา',
    'referee.matchTeamsVs': '{home} พบ {away}',
    'referee.playerTimeTracking': 'ติดตามเวลานักเตะ',
    'referee.noPlayersTracked': 'ยังไม่มีนักเตะถูกติดตาม',
    'referee.players': '{count} คน',
    'referee.totalMinutes': '{count} นาทีรวม',
    // Warnings
    'referee.sevenPlayerLimitExceeded': 'เกินจำนวนผู้เล่น 7 คน!',
    'referee.currentPlayersOnField': 'ขณะนี้มี {count} คนในสนาม',
    'referee.limit': 'เกินขีดจำกัด',
    'referee.approachingLimit': 'ใกล้ถึงขีดจำกัด',
    'referee.sClassHalfLimit': 'S-Class จำกัดไม่เกิน 20 นาทีต่อครึ่งเวลา',

    'referee.saveAll': 'บันทึกทั้งหมด',
    'referee.exportSummary': 'ส่งออก',
    'referee.goal': '{count} ประตู',
    'referee.goals': '{count} ประตู',
    'referee.card': '{count} ใบ',
    'referee.cards': '{count} ใบ',
    'referee.playerTime': '{count} เวลานักเตะ',
    'referee.playerTimes': '{count} เวลานักเตะ',
    'referee.unsaved': '{count} ยังไม่บันทึก',

    'referee.chooseMatchPlaceholder': 'เลือกแมตช์ที่ต้องการจัดการ...',
    'referee.selectFixture': 'เลือกแมตช์',
    'referee.matchSelectionTitle': 'เลือกแมตช์',
    
    // 7-a-side validation & alerts
    'referee.rulesClear': 'กฎ 7 คน: ปลอดภัยทุกประการ',
    'referee.onField': '{count}/{limit} ในสนาม',
    'referee.currentHalf': 'ครึ่งที่ {half} - {time}',
    'referee.playersOnField': 'ผู้เล่นในสนาม',
    'referee.totalTracked': 'ติดตามทั้งหมด',
    'referee.criticalViolations': 'ตรวจพบการละเมิดกฎร้ายแรง',
    'referee.immediateAction': 'ต้องดำเนินการทันที',
    'referee.exceededLimit': 'เกินขีดจำกัด',
    'referee.approachingLimit': 'ใกล้ถึงขีดจำกัด',
    'referee.needsMoreTime': 'ต้องการเวลาเพิ่ม',
    'referee.allClear': 'ปลอดภัย',
    'referee.substituteNow': 'ต้องเปลี่ยนตัวทันที',
    'referee.mustSubstitute': 'ผู้เล่น S-Class จำกัดไม่เกิน 20 นาทีต่อครึ่งเวลา - ต้องเปลี่ยนตัว',
    'referee.needsMoreToReachMinimum': 'ต้องการอีก {time} เพื่อครบขั้นต่ำ',
    'referee.playersOnFieldLabel': 'ในสนาม',
    'referee.totalTrackedLabel': 'ติดตาม',
    'referee.time': '{time}',
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
