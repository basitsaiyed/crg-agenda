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

export const DEFAULT_CRG_SLATE: MeetingSlate = {
  meetingNumber: '#1',
  date: '',
  startTime: '10:45 AM',
  endTime: '12:30 PM',
  venue: '',
  theme: '',
  clubName: 'CRG TOASTMASTERS',
  clubSubtitle: 'Run by Runners',
  clubMission:
    'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth',
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
  speakers: [],
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
  const startPeriod = startMins >= 12 * 60 && startMins < 24 * 60 ? 'PM' : 'AM';
  const endPeriod = endMins >= 12 * 60 && endMins < 24 * 60 ? 'PM' : 'AM';

  if (startPeriod === endPeriod) {
    return `${minutesToTimeStr(startMins, false)}–${minutesToTimeStr(endMins, true)}`;
  } else {
    return `${minutesToTimeStr(startMins, true)}–${minutesToTimeStr(endMins, true)}`;
  }
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

  // 1. Opening
  addSeg(2, 'Sergeant-at-Arms address', saa, 'opening');
  addSeg(3, "PO's address", po, 'opening');
  addSeg(10, 'TMOD Opening & Meeting overview', tmod, 'opening', true);

  const tagTeam = [ge, timer, ahCounter, grammarian].filter(Boolean).join(' / ');
  addSeg(10, "General Evaluator's introduction, TAG team objectives", tagTeam, 'opening', true);
  addSeg(2, 'Handover stage back to TMOD', tmod, 'transition');

  // 2. Prepared Speeches
  if (speakers.length === 0) {
    addSeg(10, 'Prepared Speeches Session (No speakers currently listed)', tmod, 'speech');
  } else {
    speakers.forEach((spk, idx) => {
      const spkNum = idx + 1;
      const evalName = spk.evaluatorName || `Evaluator ${spkNum}`;
      const spkName = spk.name || `Speaker ${spkNum}`;
      const projectTitle = spk.project ? ` – ${spk.project}` : '';

      addSeg(2, `Speech Objective By Evaluator ${spkNum}`, evalName, 'speech-intro');
      const slotDuration = spk.durationMax ? Math.max(spk.durationMax + 1, 6) : 8;
      addSeg(slotDuration, `Speaker ${spkNum}${projectTitle}`, spkName, 'speech', true);
    });
  }

  // 3. Table Topics
  addSeg(2, 'TMOD transition to Table Topics', tmod, 'transition');
  const ttDuration = slate.tableTopicsDuration || 20;
  addSeg(ttDuration, 'Table Topics', ttm, 'table-topics', true);

  // 4. Evaluations
  addSeg(2, 'TMOD to General Evaluator Transition', tmod, 'transition');
  if (speakers.length > 0) {
    const evalNames = speakers.map((s, i) => s.evaluatorName || `Evaluator ${i + 1}`).join(' / ');
    const evalTotalTime = Math.max(Math.round(speakers.length * 3.5), 5);
    addSeg(evalTotalTime, `Speech Evaluations (3:30 each)`, evalNames, 'evaluation', true);
  } else {
    addSeg(7, 'Speech Evaluations', ge, 'evaluation', true);
  }

  // 5. Reports
  const tagReportNames = [grammarian, ahCounter, timer].filter(Boolean).join(' / ');
  addSeg(slate.tagReportsDuration || 5, 'TAG Reports (1:30 each)', tagReportNames, 'reports', true);
  addSeg(slate.geReportDuration || 5, 'GE Report', ge, 'reports', true);

  // 6. Closing
  addSeg(2, 'TMOD Closing - Handover to PO', tmod, 'transition');
  const targetEndMins = timeToMinutes(slate.endTime);
  const remainingMins = Math.max(targetEndMins - currentMins, 5);
  addSeg(remainingMins, 'Meeting Awards, Feedback and Closing', po, 'closing', true);

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
    result.endTime = timeMatch[2].trim();
  }

  const venueMatch = text.match(/Venue:\s*([^\n]+)/i);
  if (venueMatch) result.venue = venueMatch[1].trim();

  const themeMatch = text.match(/Theme\s*[-–:]*\s*([^\)\n]+)/i);
  if (themeMatch) result.theme = themeMatch[1].trim();

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
