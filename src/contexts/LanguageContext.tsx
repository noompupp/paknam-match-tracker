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
    'match.completed': 'จบการแข่งขัน',
    'match.live': 'กำลังแข่ง',
    'match.scheduled': 'กำหนดการ',
    'match.fullTime': 'จบเกม',
    'match.vs': 'VS',

    // Referee tools - Top nav/tabs
    'referee.title': 'เครื่องมือผู้ตัดสิน',
    'referee.subtitle': 'จัดการแมตช์และสถิตินักเตะ',
    'referee.cardsManagement': 'จัดการใบเหลือง-แดง',
    'referee.scoreManagement': 'จัดการคะแนน',
    'referee.timeTracking': 'ติดตามเวลา',
    'referee.matchSummary': 'สรุปการแข่งขัน',
    'referee.ready': 'พร้อม',
    'referee.issues': 'มีปัญหา',
    'referee.save': 'บันทึกทันที',
    'referee.saving': 'กำลังบันทึก...',
    'referee.export': 'ส่งออก',
    'referee.cardsAutoSaveEnhanced': 'การบันทึกใบเหลืองใบแดงอัตโนมัติ (ขั้นสูง)',
    'referee.cardsAutoSaveTip': 'มีการบันทึกใบเหลืองใบแดงอัตโนมัติทุก 3 นาที พร้อมซิงค์ฐานข้อมูล',
    'referee.loadingFixtures': 'กำลังโหลดตารางแข่งขัน...',
    'referee.matchSelection': 'เลือกแมตช์',
    'referee.homeTeam': 'ทีมเหย้า',
    'referee.awayTeam': 'ทีมเยือน',
    'referee.cancel': 'ยกเลิก',
    // Tab labels
    'referee.tab.timer': 'เวลา',
    'referee.tab.score': 'สกอร์',
    'referee.tab.cards': 'ใบเหลือง-แดง',
    'referee.tab.summary': 'สรุป',
    'referee.tab.playerTime': 'เวลาในสนาม',

    // Match events
    'event.goal': 'ประตู',
    'event.assist': 'แอสซิสต์',
    'event.yellowCard': 'ใบเหลือง',
    'event.redCard': 'ใบแดง',
    'event.substitution': 'เปลี่ยนตัว',

    // Forms
    'form.selectPlayer': 'เลือกนักเตะ',
    'form.selectTeam': 'เลือกทีม',
    'form.matchTime': 'เวลาแข่งขัน',
    'form.required': 'จำเป็นต้องระบุ',

    // Time
    'time.minute': 'นาที',
    'time.minutes': 'นาที',
    'time.halfTime': 'พักครึ่ง',
    'time.firstHalf': 'ครึ่งแรก',
    'time.secondHalf': 'ครึ่งหลัง',
    'time.overtime': 'ต่อเวลา',

    // Messages
    'message.signInRequired': 'กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้',
    'message.matchSaved': 'บันทึกข้อมูลแมตช์เรียบร้อยแล้ว',
    'message.matchReset': 'รีเซ็ตแมตช์เรียบร้อย',
    'message.playerAdded': 'เพิ่มนักเตะในการติดตามเรียบร้อย',
    'message.playerRemoved': 'ลบนักเตะออกจากการติดตามแล้ว',

    // Language
    'language.english': 'English',
    'language.thai': 'ไทย',
    'language.changeLanguage': 'เปลี่ยนภาษา',

    // Referee tools (expanded: all unique keys, none duplicated)
    'referee.noMatchSelected': 'ยังไม่ได้เลือกแมตช์',
    'referee.selectMatchTooltip': 'กรุณาเลือกแมตช์เพื่อใช้งานเครื่องมือนี้',
    'referee.quickActions': 'การทำงานด่วน',
    'referee.quickGoals': 'บันทึกประตูด่วน',
    'referee.matchData': 'ข้อมูลการแข่งขัน',
    'referee.unsavedChanges': 'ข้อมูลยังไม่บันทึก',
    'referee.completed': 'จบแล้ว',
    'referee.live': 'กำลังแข่งขัน',
    'referee.paused': 'หยุดชั่วคราว',
    'referee.start': 'เริ่ม',
    'referee.pause': 'หยุด',
    'referee.reset': 'รีเซ็ต',
    'referee.scheduled': 'รอแข่ง',
    'referee.scored': 'มีสกอร์',
    'referee.dataReady': 'ข้อมูลครบถ้วน',
    'referee.dataIssues': 'ข้อมูลไม่ครบถ้วน',
    'referee.matchTeamsVs': '{home} พบ {away}',
    'referee.playerTimeTracking': 'ติดตามเวลาผู้เล่นในสนาม',
    'referee.noPlayersTracked': 'ยังไม่มีนักเตะที่ติดตาม',
    'referee.players': '{count} คน',
    'referee.totalMinutes': '{count} นาที (รวม)',
    'referee.saveAll': 'บันทึกทั้งหมด',
    'referee.exportSummary': 'ส่งออก',
    'referee.goal': '{count} ประตู',
    'referee.goals': '{count} ประตู',
    'referee.card': '{count} ใบ',
    'referee.cards': '{count} ใบ',
    'referee.playerTime': '{count} รายการเวลา',
    'referee.playerTimes': '{count} รายการเวลา',
    'referee.unsaved': '{count} ยังไม่ได้บันทึก',

    // NEW: Timer section and time tracker
    'referee.matchTimer': 'นาฬิกาแข่งขัน',
    'referee.timer': 'เวลา',
    'referee.timerPaused': 'หยุด',
    'referee.timerRunning': 'กำลังเดิน',
    'referee.startTimer': 'เริ่มจับเวลา',
    'referee.pauseTimer': 'หยุดเวลา',
    'referee.resumeTimer': 'ดำเนินการต่อ',
    'referee.resetTimer': 'รีเซ็ตเวลา',
    'referee.currentTime': 'เวลาปัจจุบัน',
    'referee.matchDate': 'วันที่แข่ง',
    'referee.phaseFirst': 'ครึ่งแรก',
    'referee.phaseSecond': 'ครึ่งหลัง',
    'referee.phaseOvertime': 'ต่อเวลา',
    'referee.timeOnField': 'เวลาในสนาม',

    // 7-a-side validation & alerts
    'referee.rulesClear': 'กฎ 7 คน: ทุกอย่างถูกต้อง',
    'referee.onField': '{count}/{limit} ในสนาม',
    'referee.currentHalf': 'ครึ่งที่ {half} - {time}',
    'referee.playersOnField': 'ผู้เล่นในสนาม',
    'referee.totalTracked': 'ผู้เล่นที่ติดตาม',
    'referee.criticalViolations': 'พบการละเมิดกฎรุนแรง',
    'referee.immediateAction': 'ต้องดำเนินการทันที',
    'referee.sevenPlayerLimitExceeded': 'มีผู้เล่นเกิน 7 คนในสนาม!',
    'referee.currentPlayersOnField': 'ขณะนี้มี {count} คนในสนาม',
    'referee.limit': 'จำกัด',
    'referee.exceededLimit': 'เกินขีด',
    'referee.approachingLimit': 'ใกล้ถึงขีด',
    'referee.sClassHalfLimit': 'ผู้เล่น S-Class จำกัดเวลา 20 นาที/ครึ่ง',
    'referee.mustSubstitute': 'S-Class จำกัด 20 นาทีต่อครึ่ง - ต้องเปลี่ยนตัว',
    'referee.needsMoreTime': 'ขาดเวลา',
    'referee.needsMoreToReachMinimum': 'ต้องอีก {time} เพื่อขั้นต่ำ',
    'referee.playersOnFieldLabel': 'ในสนาม',
    'referee.totalTrackedLabel': 'ติดตาม',
    'referee.time': '{time}',
    'referee.allClear': 'ปลอดภัย',
    'referee.substituteNow': 'ต้องเปลี่ยนตัวทันที',

    // Match selection & fixture
    'referee.chooseMatchPlaceholder': 'เลือกแมตช์ที่จัดการ...',
    'referee.selectFixture': 'เลือกแมตช์',
    'referee.matchSelectionTitle': 'เลือกแมตช์',

    // Card/score summary
    'referee.scoreSummary': 'สรุปผลคะแนน',
    'referee.cardsSummary': 'สรุปใบเหลือง-แดง',
    'referee.goalsSummary': 'สรุปประตู',
    'referee.unsavedCardChanges': 'มีใบเหลือง-แดงที่ยังไม่ได้บันทึก',
    'referee.unsavedGoalChanges': 'มีประตูที่ยังไม่ได้บันทึก',
    'referee.unsavedPlayerTimeChanges': 'มีเวลาผู้เล่นที่ยังไม่ได้บันทึก',

    // Score & goal recording
    'referee.recordGoal': 'บันทึกประตู',
    'referee.openGoalEntryWizard': 'เปิดตัวช่วยบันทึกประตู',
    'referee.recordGoalsFor': 'บันทึกประตูของ {home} vs {away}',
    'referee.goalEntryWizardDesc': 'ใช้ตัวช่วยเพื่อบันทึกประตูและรายละเอียด',
    'referee.detailedGoalEntry': 'บันทึกประตูแบบละเอียด',

    // Player Time
    'referee.selectStartingSquad': 'เลือกตัวจริง ({count} คน)',
    'referee.selectTeam': 'เลือกทีม',
    'referee.trackedPlayers': 'ผู้เล่นที่ติดตาม',
    'referee.addPlayerToTracking': 'เพิ่มผู้เล่นเข้าสู่การติดตาม',
    'referee.removePlayerFromTracking': 'ลบผู้เล่นออกจากการติดตาม',
    'referee.toggleTime': 'สลับสถานะเวลา',
    'referee.playerTimeValidation': 'การตรวจสอบเวลาในสนาม',
    'referee.trackedTime': 'เวลาที่ติดตาม',
    'referee.startingSquadSelected': 'เลือกตัวจริงเรียบร้อยแล้ว',
    'referee.requiredPlayersOnField': 'ต้องมีผู้เล่นในสนาม {count} คนเสมอ',

    // Substitution
    'referee.manageSubstitution': 'จัดการเปลี่ยนตัว',
    'referee.makeSubstitution': 'เปลี่ยนตัว',
    'referee.substitutePlayer': 'เปลี่ยนตัวผู้เล่น',
    'referee.confirmSubstitution': 'ยืนยันการเปลี่ยนตัว',
    'referee.substituteSuccess': 'เปลี่ยนตัวเรียบร้อยแล้ว',

    // Labels for summary + data views
    'referee.matchStatus': 'สถานะแมตช์',
    'referee.score': 'สกอร์',
    'referee.summary': 'สรุป',
    'referee.team': 'ทีม',
    'referee.player': 'นักเตะ',
    'referee.minute': 'นาที',
    'referee.recordedAt': 'บันทึกที่',

    // Miscellaneous - refs
    'referee.officials': 'ผู้ตัดสิน',
    'referee.matchOfficials': 'คณะกรรมการ',
    'referee.referee': 'กรรมการ',
    'referee.assistantReferee': 'ไลน์แมน',
    'referee.fourthOfficial': 'ผู้ช่วยที่ 4',
    // End of Thai object
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
