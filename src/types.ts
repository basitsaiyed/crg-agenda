/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClubOfficer {
  position: string;
  name: string;
}

export interface RolePlayers {
  tmod: string;
  generalEvaluator: string;
  tableTopicsMaster: string;
  grammarian: string;
  timer: string;
  ahCounter: string;
  sergeantAtArms: string;
  presidingOfficer: string;
}

export interface SpeakerSlot {
  id: string;
  name: string;
  project: string;
  evaluatorName: string;
  durationMax: number;
}

export type AgendaCategory = 
  | 'opening' 
  | 'speech-intro' 
  | 'speech' 
  | 'table-topics' 
  | 'evaluation' 
  | 'reports' 
  | 'closing'
  | 'transition';

export interface AgendaSegment {
  id: string;
  timeStart: string;
  timeEnd: string;
  durationMinutes: number;
  program: string;
  accountability: string;
  category: AgendaCategory;
  isCustomizable?: boolean;
}

export interface MeetingSlate {
  meetingNumber: string;
  date: string;
  startTime: string; // e.g. "10:45 AM"
  endTime: string;   // e.g. "12:30 PM"
  venue: string;
  theme: string;
  clubName: string;
  clubSubtitle: string;
  clubMission: string;
  officers: ClubOfficer[];
  rolePlayers: RolePlayers;
  speakers: SpeakerSlot[];
  tableTopicsDuration?: number; // default 20
  tagReportsDuration?: number;  // default 5
  geReportDuration?: number;    // default 5
}
