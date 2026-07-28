import agendaTemplateHtml from '../templates/crg-agenda-structure.html?raw';
import { MeetingSlate, AgendaSegment, AgendaCategory } from '../types';

/** Categories that act as a "section header" — bold + show time */
const MAIN_CATEGORIES = new Set<AgendaCategory>([
  'opening',
  'speech-intro',
  'speech',
  'table-topics',
  'evaluation',
  'reports',
  'closing',
  'transition',
]);

/** Categories that trigger a visual gap BEFORE them */
const GAP_BEFORE = new Set<AgendaCategory>([
  'speech-intro',
  'speech',
  'table-topics',
  'evaluation',
  'reports',
  'closing',
]);

export function renderAgendaHtml(slate: MeetingSlate, timeline: AgendaSegment[]): string {
  const themeHtml = slate.theme
    ? `<p class="theme-line">Theme: &ldquo;${slate.theme}&rdquo;</p>`
    : '';

  let agendaRowsHtml = '';

  timeline.forEach((seg, idx) => {
    // Add a gap row before certain category transitions
    const prevCat = idx > 0 ? timeline[idx - 1].category : null;
    const needsGap = GAP_BEFORE.has(seg.category) && prevCat !== seg.category;

    if (needsGap) {
      agendaRowsHtml += `<tr class="seg-gap"><td colspan="3"></td></tr>\n`;
    }

    // Show only the start portion of the time range (before the en-dash)
    const startTime = seg.timeStart.split('–')[0].trim();

    const acct = seg.accountability !== 'TBA' ? seg.accountability : '';

    agendaRowsHtml += `
<tr class="seg-main">
  <td class="td-time">${startTime}</td>
  <td class="td-program">${seg.program}</td>
  <td class="td-acct">${acct}</td>
</tr>`;
  });

  return agendaTemplateHtml
    .replace('{{THEME_SECTION}}', themeHtml)
    .replace('{{AGENDA_ROWS}}', agendaRowsHtml);
}
