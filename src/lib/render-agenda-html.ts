import agendaTemplateHtml from '../templates/crg-agenda-structure.html?raw';
import { MeetingSlate, AgendaSegment } from '../types';

export function renderAgendaHtml(slate: MeetingSlate, timeline: AgendaSegment[]): string {
  const themeHtml = slate.theme
    ? `<p class="c1"><span class="c18 c5">Theme: </span><span class="c5 italic">"${slate.theme}"</span></p>`
    : '';

  const officersRowsHtml = slate.officers.map(off => `
  <tr class="c3"><td class="c13" colspan="1" rowspan="1"><p class="c4"><span class="c0">${off.position}</span></p></td><td class="c10" colspan="1" rowspan="1"><p class="c4"><span class="c5">${off.name}</span></p></td></tr>`).join('');

  const baseRoles = [
    { role: 'Toastmaster of the Day', name: slate.rolePlayers.tmod },
    { role: 'General Evaluator', name: slate.rolePlayers.generalEvaluator },
    { role: 'Grammarian', name: slate.rolePlayers.grammarian },
    { role: 'Ah Counter', name: slate.rolePlayers.ahCounter },
    { role: 'Timer', name: slate.rolePlayers.timer },
    { role: 'Table Topics Master', name: slate.rolePlayers.tableTopicsMaster },
  ];

  let rolePlayersRowsHtml = baseRoles.map(item => `
  <tr class="c6"><td class="c11" colspan="1" rowspan="1"><p class="c4"><span class="c0">${item.role}</span></p></td><td class="c9" colspan="1" rowspan="1"><p class="c4"><span class="c5">${item.name || '-'}</span></p></td></tr>`).join('');

  slate.speakers.forEach((spk, idx) => {
    rolePlayersRowsHtml += `
  <tr class="c6"><td class="c11" colspan="1" rowspan="1"><p class="c4"><span class="c0">Speaker ${idx + 1}</span></p></td><td class="c9" colspan="1" rowspan="1"><p class="c4"><span class="c5">${spk.name}</span></p></td></tr>
  <tr class="c6"><td class="c11" colspan="1" rowspan="1"><p class="c4"><span class="c0">Evaluator ${idx + 1}</span></p></td><td class="c9" colspan="1" rowspan="1"><p class="c4"><span class="c0">${spk.evaluatorName || 'TBA'}</span></p></td></tr>`;
  });

  const agendaRowsHtml = timeline.map(seg => `
  <tr class="c6"><td class="c14" colspan="1" rowspan="1"><p class="c2"><span class="c15">${seg.timeStart}</span></p></td><td class="c9" colspan="1" rowspan="1"><p class="c2"><span class="c16 c8">${seg.program}</span></p></td><td class="c20" colspan="1" rowspan="1"><p class="c2"><span class="c15">${seg.accountability}</span></p></td></tr>`).join('');

  return agendaTemplateHtml
    .replace('{{DATE}}', slate.date)
    .replace('{{MEETING_NUMBER}}', slate.meetingNumber)
    .replace('{{THEME_SECTION}}', themeHtml)
    .replace('{{CLUB_OFFICERS_ROWS}}', officersRowsHtml)
    .replace('{{ROLE_PLAYERS_ROWS}}', rolePlayersRowsHtml)
    .replace('{{AGENDA_ROWS}}', agendaRowsHtml);
}

