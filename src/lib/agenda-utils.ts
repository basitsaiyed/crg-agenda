/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeetingSlate, AgendaSegment, ClubOfficer } from '../types';

export const DEFAULT_CLUB_OFFICERS: ClubOfficer[] = [
  { position: 'President', name: 'Harsh' },
  { position: 'VP Education', name: 'Basit' },
  { position: 'VP Membership', name: 'Sourav' },
  { position: 'VP Public Relations', name: 'Vatsal' },
  { position: 'Secretary', name: 'Shantanu' },
  { position: 'Treasurer', name: 'Gautam' },
  { position: 'Sergeant-at-Arms', name: 'Tejas' },
];

export const RAW_SAMPLE_SLATE_TEXT = `🎯 HEY GUYS, THE SLATE FOR THIS SUNDAY IS OUT! 🎯
AS TLTP IS POSTPONED LETS GO WITH OUR HIGH ENERGY MEETINGS 🔥🔥

Dear CRGians, 👋

Get ready for another high-energy Toastmasters session! This Sunday, we’re coming together to practice, perform, and polish our public speaking and impromptu skills. 💫

📢 Meeting #63
📆 Date: Sunday, 26th July 2026
🕰 Time: 10:45 AM – 12:30 PM (IST)
🏢 Venue: GIFT City Fire Station, Gandhinagar, Gujarat

———————————————
🎭 Role Players
———————————————
👩🏻✈️ TMOD: Shantanu (Theme -Brewing Bonds: Chai, Rain & Friendship)
🕵️ General Evaluator: Prasoon
🎯 Table Topics Master (TTM): Sourav Asija
👩🏫 Grammarian: Akshay
⏱ Timer: Aashi Bhandari (Gavel)
👷 Ah Counter: Shrey

———————————————
🎤 Prepared Speakers & Evaluators
———————————————
🎤 Speaker 1: Harsh Raweel
📘 Level & Project: Persuasive influencer- L3 P2- (elective 1) Social Speech 
👨🏫 Evaluator 1: Megha Bhatt

🎤 Speaker 2: Prakhar Verma
📘 Level & Project: L4P2
👨🏫 Evaluator 2: Basit Saiyed

✨ "Speak with conviction, listen with intent, and grow with every meeting."`;

export const DEFAULT_CRG_SLATE: MeetingSlate = {
  meetingNumber: '#63',
  date: '26/07/2026',
  startTime: '10:45 AM',
  endTime: '12:30 PM',
  venue: 'GIFT CITY, Fire Station, Training Room, First Floor, Gandhinagar',
  theme: 'Brewing Bonds: Chai, Rain & Friendship',
  clubName: 'CRG TOASTMASTERS',
  clubSubtitle: 'Run by Runners',
  clubMission:
    'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth',
  officers: DEFAULT_CLUB_OFFICERS,
  rolePlayers: {
    tmod: 'Shantanu',
    generalEvaluator: 'Prasoon',
    tableTopicsMaster: 'Sourav Asija',
    grammarian: 'Akshay',
    timer: 'Aashi Bhandari (Gavel)',
    ahCounter: 'Shrey',
    sergeantAtArms: 'Tejas',
    presidingOfficer: 'Harsh',
  },
  speakers: [
    {
      id: 'spk-1',
      name: 'Harsh Raweel',
      project: 'L3 P2 - Persuasive Influencer (Social Speech)',
      evaluatorName: 'Megha Bhatt',
      durationMax: 7,
    },
    {
      id: 'spk-2',
      name: 'Prakhar Verma',
      project: 'L4P2',
      evaluatorName: 'Basit Saiyed',
      durationMax: 7,
    },
  ],
  tableTopicsDuration: 20,
  tagReportsDuration: 5,
  geReportDuration: 5,
};

/**
 * Convert time string like "10:45 AM" or "10:45" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return 10 * 60 + 45; // default 10:45 AM

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Convert total minutes from midnight back to formatted string like "10:45 AM" or "10:45–10:47 AM"
 */
export function minutesToTimeStr(minutes: number, includePeriod: boolean = true): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const minStr = mins < 10 ? `0${mins}` : `${mins}`;
  return includePeriod ? `${hours}:${minStr} ${period}` : `${hours}:${minStr}`;
}

export function formatTimeRange(startMins: number, endMins: number): string {
  const startPeriod = startMins >= 12 * 60 && startMins < 24 * 60 ? 'PM' : 'AM';
  const endPeriod = endMins >= 12 * 60 && endMins < 24 * 60 ? 'PM' : 'AM';

  // If periods match (e.g., both AM or both PM), we can omit period on start time for clean CRG style like "10:45–10:47 AM"
  if (startPeriod === endPeriod) {
    const startStr = minutesToTimeStr(startMins, false);
    const endStr = minutesToTimeStr(endMins, true);
    return `${startStr}–${endStr}`;
  } else {
    return `${minutesToTimeStr(startMins, true)}–${minutesToTimeStr(endMins, true)}`;
  }
}

/**
 * Dynamic Agenda Calculation Engine
 * Scales segments based on number of speakers and evaluators
 */
export function calculateAgendaTimeline(slate: MeetingSlate): AgendaSegment[] {
  const segments: AgendaSegment[] = [];
  let currentMins = timeToMinutes(slate.startTime);

  const addSeg = (
    duration: number,
    program: string,
    accountability: string,
    category: AgendaSegment['category'],
    isCustomizable = false
  ) => {
    const endMins = currentMins + duration;
    segments.push({
      id: `seg-${segments.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
      timeStart: minutesToTimeStr(currentMins, true),
      timeEnd: minutesToTimeStr(endMins, true),
      durationMinutes: duration,
      program,
      accountability: accountability || 'TBA',
      category,
      isCustomizable,
    });
    currentMins = endMins;
  };

  const { rolePlayers, speakers } = slate;
  const tmod = rolePlayers.tmod || 'TMOD';
  const ge = rolePlayers.generalEvaluator || 'General Evaluator';
  const ttm = rolePlayers.tableTopicsMaster || 'Table Topics Master';
  const grammarian = rolePlayers.grammarian || 'Grammarian';
  const timer = rolePlayers.timer || 'Timer';
  const ahCounter = rolePlayers.ahCounter || 'Ah Counter';
  const saa = rolePlayers.sergeantAtArms || 'Sergeant-at-Arms';
  const po = rolePlayers.presidingOfficer || 'Presiding Officer';

  // 1. Opening Section
  addSeg(2, 'Sergeant-at-Arms address', saa, 'opening');
  addSeg(3, "PO's address", po, 'opening');
  addSeg(10, 'TMOD Opening & Meeting overview', tmod, 'opening', true);

  const tagTeam = [ge, timer, ahCounter, grammarian].filter(Boolean).join(' / ');
  addSeg(10, "General Evaluator's introduction, TAG team objectives", tagTeam, 'opening', true);
  addSeg(2, 'Handover stage back to TMOD', tmod, 'transition');

  // 2. Prepared Speeches Section (Dynamically Scaled!)
  if (speakers.length === 0) {
    addSeg(10, 'Prepared Speeches Session (No speakers currently listed)', tmod, 'speech');
  } else {
    speakers.forEach((spk, idx) => {
      const spkNum = idx + 1;
      const evalName = spk.evaluatorName || `Evaluator ${spkNum}`;
      const spkName = spk.name || `Speaker ${spkNum}`;
      const projectTitle = spk.project ? ` – ${spk.project}` : '';

      // Speech objective by evaluator (2 mins)
      addSeg(2, `Speech Objective By Evaluator ${spkNum}`, evalName, 'speech-intro');
      
      // Actual speech (default 8 mins slot for a 5-7 min speech, or max + 1)
      const slotDuration = spk.durationMax ? Math.max(spk.durationMax + 1, 6) : 8;
      addSeg(slotDuration, `Speaker ${spkNum}${projectTitle}`, spkName, 'speech', true);
    });
  }

  // Transition to Table Topics
  addSeg(2, 'TMOD transition to Table Topics', tmod, 'transition');

  // 3. Table Topics Section
  const ttDuration = slate.tableTopicsDuration || 20;
  addSeg(ttDuration, 'Table Topics', ttm, 'table-topics', true);

  // Transition to Evaluations
  addSeg(2, 'TMOD to General Evaluator Transition', tmod, 'transition');

  // 4. Evaluations Section (Dynamically scaled for each speaker!)
  if (speakers.length > 0) {
    const evalNames = speakers
      .map((s, i) => s.evaluatorName || `Evaluator ${i + 1}`)
      .join(' / ');
    // Standard CRG timing: around 3:30 (3.5 mins) per evaluator rounded
    const evalTotalTime = Math.max(Math.round(speakers.length * 3.5), 5);
    addSeg(evalTotalTime, `Speech Evaluations (${speakers.length > 0 ? '3:30 each' : 'General'})`, evalNames, 'evaluation', true);
  } else {
    addSeg(7, 'Speech Evaluations', ge, 'evaluation', true);
  }

  // 5. Reports Section
  const tagReportNames = [grammarian, ahCounter, timer].filter(Boolean).join(' / ');
  const tagDuration = slate.tagReportsDuration || 5;
  addSeg(tagDuration, 'TAG Reports (1:30 each)', tagReportNames, 'reports', true);

  const geDuration = slate.geReportDuration || 5;
  addSeg(geDuration, 'GE Report', ge, 'reports', true);

  // 6. Closing Section
  addSeg(2, 'TMOD Closing - Handover to PO', tmod, 'transition');

  // Calculate remaining time until endTime if any, or default 9 mins
  const targetEndMins = timeToMinutes(slate.endTime);
  const remainingMins = Math.max(targetEndMins - currentMins, 5);
  addSeg(remainingMins, 'Meeting Awards, Feedback and Closing', po, 'closing', true);

  // Formatting final timeStart and timeEnd strings with range format
  return segments.map(seg => {
    const startM = timeToMinutes(seg.timeStart);
    const endM = timeToMinutes(seg.timeEnd);
    return {
      ...seg,
      timeStart: formatTimeRange(startM, endM)
    };
  });
}

/**
 * Basic regex-based local fallback parser for quick client-side slate parsing
 */
export function parseSlateTextLocally(text: string): Partial<MeetingSlate> {
  const lines = text.split(/\r?\n/);
  const result: Partial<MeetingSlate> = {
    rolePlayers: {
      tmod: '',
      generalEvaluator: '',
      tableTopicsMaster: '',
      grammarian: '',
      timer: '',
      ahCounter: '',
      sergeantAtArms: 'Tejas',
      presidingOfficer: 'Harsh',
    },
    speakers: [],
  };

  // Extract Meeting Number
  const mtgMatch = text.match(/Meeting\s*[#:]*\s*(\d+)/i);
  if (mtgMatch) result.meetingNumber = `#${mtgMatch[1]}`;

  // Extract Date
  const dateMatch = text.match(/Date:\s*([^\n]+)/i);
  if (dateMatch) result.date = dateMatch[1].replace(/Sunday,?\s*/i, '').trim();

  // Extract Time
  const timeMatch = text.match(/Time:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (timeMatch) {
    result.startTime = timeMatch[1].trim();
    result.endTime = timeMatch[2].trim();
  }

  // Extract Venue
  const venueMatch = text.match(/Venue:\s*([^\n]+)/i);
  if (venueMatch) result.venue = venueMatch[1].trim();

  // Extract Theme from TMOD line or Theme line
  const themeMatch = text.match(/Theme\s*[-–:]*\s*([^\)\n]+)/i);
  if (themeMatch) result.theme = themeMatch[1].trim();

  // Extract Role Players
  for (const line of lines) {
    if (/TMOD|Toastmaster of the Day/i.test(line)) {
      const name = line.replace(/.*(?:TMOD|Toastmaster of the Day)\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.tmod = name;
    }
    if (/General Evaluator|GE/i.test(line) && !/Transition/i.test(line)) {
      const name = line.replace(/.*(?:General Evaluator|GE)\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.generalEvaluator = name;
    }
    if (/Table Topics Master|TTM/i.test(line)) {
      const name = line.replace(/.*(?:Table Topics Master|TTM)\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.tableTopicsMaster = name;
    }
    if (/Grammarian/i.test(line)) {
      const name = line.replace(/.*Grammarian\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.grammarian = name;
    }
    if (/Timer/i.test(line)) {
      const name = line.replace(/.*Timer\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.timer = name;
    }
    if (/Ah\s*Counter/i.test(line)) {
      const name = line.replace(/.*Ah\s*Counter\s*[:–-]\s*([^\(\n]+).*/i, '$1').trim();
      if (name && result.rolePlayers) result.rolePlayers.ahCounter = name;
    }
  }

  // Extract Speakers and Evaluators
  const speakerBlocks = text.split(/Speaker\s*(\d+)\s*[:–-]/i);
  if (speakerBlocks.length > 1) {
    const spks = [];
    for (let i = 1; i < speakerBlocks.length; i += 2) {
      const num = speakerBlocks[i];
      const block = speakerBlocks[i + 1] || '';
      const nameMatch = block.match(/^\s*([^\n📘👨🏫-]+)/);
      const name = nameMatch ? nameMatch[1].trim() : `Speaker ${num}`;

      const projMatch = block.match(/(?:Level & Project|Project)\s*[:–-]\s*([^\n👨🏫]+)/i);
      const project = projMatch ? projMatch[1].trim() : 'Prepared Speech';

      const evalMatch = block.match(/(?:Evaluator\s*\d*|Eval)\s*[:–-]\s*([^\n]+)/i);
      const evaluatorName = evalMatch ? evalMatch[1].trim() : `Evaluator ${num}`;

      if (name && name !== `Speaker ${num}` && !name.includes('Level &')) {
        spks.push({
          id: `spk-${num}-${Math.random().toString(36).substring(2, 5)}`,
          name,
          project,
          evaluatorName: evaluatorName !== `Evaluator ${num}` ? evaluatorName : '',
          durationMax: 7,
        });
      }
    }
    if (spks.length > 0) {
      result.speakers = spks;
    }
  }

  return result;
}
