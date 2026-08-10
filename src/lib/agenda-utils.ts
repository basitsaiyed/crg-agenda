/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeetingSlate, AgendaSegment, ClubOfficer } from '../types';

export const DEFAULT_CLUB_OFFICERS: ClubOfficer[] = [
  { position: 'President', name: 'Harsh Raval' },
  { position: 'VP Education', name: 'Basit Saiyed' },
  { position: 'VP Membership', name: 'Sourav Asija' },
  { position: 'VP Public Relations', name: 'Vatsal Gajjar' },
  { position: 'Secretary', name: 'Shantanu Kher' },
  { position: 'Treasurer', name: 'Gautam Singhania' },
  { position: 'Sergeant-at-Arms', name: 'Tejas khatal' },
];

export const DEFAULT_CRG_SLATE: MeetingSlate = {
  meetingNumber: '#1',
  date: '',
  startTime: '10:30 AM',
  endTime: '12:30 PM',
  venue: 'Training Room, First Floor, Gandhinagar GIFT City Fire Department, Gandhinagar, Gujarat 382421, India',
  venueUrl: 'https://www.toastmasters.org/Find-a-Club/28678751-crg-toastmasters-club',
  theme: '',
  clubName: 'CRG Toastmasters Club',
  clubNumber: '28678751',
  clubSubtitle: 'Run by Runners',
  clubMission:
    'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth.',
  officers: DEFAULT_CLUB_OFFICERS,
  rolePlayers: {
    tmod: '',
    generalEvaluator: '',
    tableTopicsMaster: '',
    grammarian: '',
    timer: '',
    ahCounter: '',
    sergeantAtArms: '',
    presidingOfficer: '',
  },
  speakers: [
    { id: 'spk-1', name: '', project: '', evaluatorName: '', durationMax: 7 },
    { id: 'spk-2', name: '', project: '', evaluatorName: '', durationMax: 7 },
  ],
  tableTopicsDuration: 20,
  tagReportsDuration: 5,
  geReportDuration: 5,
  includeNetworking: true,
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
 * Convert total minutes from midnight back to formatted string like "10:45 AM"
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
  return `${minutesToTimeStr(startMins, true)}–${minutesToTimeStr(endMins, true)}`;
}

/**
 * Dynamic Agenda Calculation Engine
 */
export function calculateAgendaTimeline(slate: MeetingSlate): AgendaSegment[] {
  const segments: AgendaSegment[] = [];
  let currentMins = timeToMinutes(slate.startTime);

  const addSeg = (
    duration: number,
    program: string,
    accountability: string,
    category: AgendaSegment['category'],
    subItems: AgendaSegment['subItems'] = [],
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
      subItems,
    });
    currentMins = endMins;
  };

  const { rolePlayers, speakers, officers } = slate;
  const tmod = rolePlayers.tmod || 'TMOD';
  const ge = rolePlayers.generalEvaluator || 'General Evaluator';
  const ttm = rolePlayers.tableTopicsMaster || 'Table Topics Master';
  const grammarian = rolePlayers.grammarian || 'Grammarian';
  const timer = rolePlayers.timer || 'Timer';
  const ahCounter = rolePlayers.ahCounter || 'Ah Counter';

  const saaOfficer = officers.find(o => /sergeant/i.test(o.position))?.name;
  const presidentOfficer = officers.find(o => /president/i.test(o.position))?.name;
  const saa = rolePlayers.sergeantAtArms || saaOfficer || 'Sergeant-at-Arms';
  const po  = rolePlayers.presidingOfficer || presidentOfficer || 'Presiding Officer';

  // 0. Networking (optional)
  if (slate.includeNetworking !== false) {
    addSeg(15, 'Networking Session', '', 'opening', [
      { program: 'Meet fellow members and guests' },
      { program: 'Light refreshments & introductions' },
    ]);
  }

  // 1. Opening
  addSeg(2, 'Sergeant-at-Arms Calls Meeting to Order', saa, 'opening', [
    { program: "Sergeant-at-Arms' Welcome & Housekeeping" },
    { program: 'Welcome Guests' },
  ]);

  addSeg(3, "Presiding Officer's Address", po, 'opening', [
    { program: 'Club announcements & updates' },
  ]);

  addSeg(10, 'TMOD Opening & Meeting Overview', tmod, 'opening', [
    { program: 'Introduce the theme of the day' },
    { program: 'Introduce TAG team roles' },
  ], true);

  addSeg(10, "General Evaluator Introduces the TAG Team", ge, 'opening', [
    { program: 'Ah-Counter objectives', accountability: ahCounter },
    { program: 'Grammarian objectives', accountability: grammarian },
    { program: 'Timer objectives', accountability: timer },
    { program: 'Returns control to TMOD', accountability: tmod },
  ], true);

  addSeg(2, 'TMOD Introduces Prepared Speeches Session', tmod, 'transition', []);

  // 2. Prepared Speeches
  if (speakers.length === 0) {
    addSeg(10, 'Prepared Speeches Session', tmod, 'speech', [
      { program: 'No speakers currently listed' },
    ]);
  } else {
    speakers.forEach((spk, idx) => {
      const spkNum = idx + 1;
      const evalName = spk.evaluatorName || `Evaluator ${spkNum}`;
      const spkName = spk.name || `Speaker ${spkNum}`;
      const projectTitle = spk.project ? ` – ${spk.project}` : '';
      const slotDuration = spk.durationMax ? Math.max(spk.durationMax + 1, 6) : 8;

      addSeg(slotDuration + 2, `Speaker ${spkNum}${projectTitle}`, spkName, 'speech', [
        { program: `Speech Objective by Evaluator ${spkNum}`, accountability: evalName },
        { program: `${spkName}'s prepared speech` },
        { program: 'Call for Timer\'s Report', accountability: timer },
      ], true);
    });
  }

  // 3. Table Topics
  const ttDuration = slate.tableTopicsDuration || 20;
  addSeg(ttDuration + 2, 'TMOD Introduces Table Topics', tmod, 'table-topics', [
    { program: 'Table Topics session', accountability: ttm },
    { program: 'Call for Timer\'s Report', accountability: timer },
    { program: 'Returns control to TMOD', accountability: tmod },
  ], true);

  // 4. Evaluations
  addSeg(2, 'TMOD Introduces the General Evaluator', tmod, 'transition', []);

  if (speakers.length > 0) {
    const evalSubs: AgendaSegment['subItems'] = speakers.map((s, i) => ({
      program: `Speaker ${i + 1} Evaluation (3:30)`,
      accountability: s.evaluatorName || `Evaluator ${i + 1}`,
    }));
    evalSubs!.push({ program: 'Recap Evaluators & Call for Votes' });
    const evalTotalTime = Math.max(Math.round(speakers.length * 3.5), 5);
    addSeg(evalTotalTime, 'General Evaluator Calls for Evaluations', ge, 'evaluation', evalSubs, true);
  } else {
    addSeg(7, 'General Evaluator Calls for Evaluations', ge, 'evaluation', [
      { program: 'Speech evaluations (3:30 each)' },
      { program: 'Recap Evaluators & Call for Votes' },
    ], true);
  }

  // 5. Reports
  addSeg(slate.tagReportsDuration || 5, 'General Evaluator Calls for Reports', ge, 'reports', [
    { program: 'Grammarian\'s Report', accountability: grammarian },
    { program: 'Ah-Counter\'s Report', accountability: ahCounter },
    { program: 'Timer\'s Report', accountability: timer },
  ], true);

  addSeg(slate.geReportDuration || 5, 'General Evaluator\'s Report', ge, 'reports', [
    { program: 'Overall meeting evaluation' },
    { program: 'Returns control to TMOD', accountability: tmod },
  ], true);

  // 6. Closing
  addSeg(2, 'TMOD Closing – Handover to Presiding Officer', tmod, 'transition', []);

  const targetEndMins = timeToMinutes(slate.endTime) + (speakers.length > 3 ? 15 : 0);
  // Awards segment: fills between now and 2 min before target (min 3 min)
  const awardsMins = Math.max(targetEndMins - currentMins - 2, 3);
  addSeg(awardsMins, 'Meeting Awards, Feedback & Closing', po, 'closing', [
    { program: 'Best Speaker, Best Evaluator, Best Table Topics awards' },
    { program: 'General feedback & announcements' },
  ], true);

  // Force adjourned to start exactly 2 min before targetEndMins
  currentMins = targetEndMins - 2;
  addSeg(2, 'Meeting Adjourned', po, 'closing', [], true);

  return segments.map(seg => {
    const startM = timeToMinutes(seg.timeStart);
    const endM = timeToMinutes(seg.timeEnd);
    return { ...seg, timeStart: formatTimeRange(startM, endM) };
  });
}

/**
 * Basic regex-based parser for WhatsApp/email slate text
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
      sergeantAtArms: '',
      presidingOfficer: '',
    },
    speakers: [],
  };

  const mtgMatch = text.match(/Meeting\s*[#:]*\s*(\d+)/i);
  if (mtgMatch) result.meetingNumber = `#${mtgMatch[1]}`;

  const dateMatch = text.match(/Date:\s*([^\n]+)/i);
  if (dateMatch) result.date = dateMatch[1].replace(/Sunday,?\s*/i, '').trim();

  const timeMatch = text.match(/Time:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (timeMatch) {
    result.startTime = timeMatch[1].trim();
    result.endTime   = timeMatch[2].trim();
  }

  const venueMatch = text.match(/Venue:\s*([^\n]+)/i);
  if (venueMatch) result.venue = venueMatch[1].trim();

  const themeMatch = text.match(/Theme\s*[-–:]\s*([^\n)]+)/i);
  if (themeMatch) result.theme = themeMatch[1].replace(/\s*\([^)]*\)\s*/g, '').trim();

  // Helper: extract name after a role label, stripping emojis, parenthetical suffixes and extra whitespace
  const extractName = (line: string, rolePattern: RegExp): string => {
    // Remove all emoji characters first
    const clean = line.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
    const match = clean.match(rolePattern);
    if (!match) return '';
    // Strip parenthetical suffixes like (Gavel), (Guest), (HCTC), (IST) etc.
    return match[1].replace(/\s*\([^)]*\)\s*/g, '').trim();
  };

  for (const line of lines) {
    if (/TMOD|Toastmaster of the Day/i.test(line) && !/Table Topics/i.test(line)) {
      // Match "TMOD: Name" — theme part after dash/hyphen is separate
      const name = extractName(line, /(?:TMOD|Toastmaster of the Day)\s*[:–-]\s*([^(–\-\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.tmod = name;
    }
    if (/General Evaluator|(?<![A-Za-z])GE(?![A-Za-z])/i.test(line) && !/Transition|Introduces/i.test(line)) {
      const name = extractName(line, /(?:General Evaluator|GE)\s*[:–-]\s*([^\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.generalEvaluator = name;
    }
    if (/Table Topics Master|TTM/i.test(line)) {
      // Pattern: "Table Topics Master (TTM): Sainam (Gavel)" — skip past the (TTM) label
      const name = extractName(line, /(?:Table Topics Master|TTM)\s*(?:\([^)]*\)\s*)?[:–-]\s*([^\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.tableTopicsMaster = name;
    }
    if (/Grammarian/i.test(line)) {
      const name = extractName(line, /Grammarian\s*[:–-]\s*([^\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.grammarian = name;
    }
    if (/\bTimer\b/i.test(line) && !/Report|Call for/i.test(line)) {
      const name = extractName(line, /Timer\s*[:–-]\s*([^\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.timer = name;
    }
    if (/Ah\s*Counter/i.test(line)) {
      const name = extractName(line, /Ah\s*Counter\s*[:–-]\s*([^\n]+)/i);
      if (name && result.rolePlayers) result.rolePlayers.ahCounter = name;
    }
  }

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
    if (spks.length > 0) result.speakers = spks;
  }

  return result;
}
