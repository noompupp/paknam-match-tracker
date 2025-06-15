
// Messages

import { LocaleModule } from "./types";

const messages: LocaleModule = {
  en: {
    'message.signInRequired': 'Please sign in to access this feature',
    'message.matchSaved': 'Match data saved successfully',
    'message.matchReset': 'Match has been reset',
    'message.playerAdded': 'Player added to tracking',
    'message.playerRemoved': 'Player removed from tracking',
  },
  th: {
    'message.signInRequired': 'กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้',
    'message.matchSaved': 'บันทึกข้อมูลแมตช์เรียบร้อยแล้ว',
    'message.matchReset': 'รีเซ็ตแมตช์เรียบร้อย',
    'message.playerAdded': 'เพิ่มนักเตะในการติดตามเรียบร้อย',
    'message.playerRemoved': 'ลบนักเตะออกจากการติดตามแล้ว',
  }
};

export default messages;
