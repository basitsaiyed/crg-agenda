import agendaTemplateHtml from '../templates/crg-agenda-structure.html?raw';
import { MeetingSlate, AgendaSegment, AgendaCategory } from '../types';

/** Categories that trigger a visual gap row BEFORE them when the category changes */
const GAP_BEFORE = new Set<AgendaCategory>([
  'speech-intro',
  'speech',
  'table-topics',
  'evaluation',
  'reports',
  'closing',
  'transition',
]);

export function renderAgendaHtml(slate: MeetingSlate, timeline: AgendaSegment[]): string {
  const themeHtml = slate.theme
    ? `<p class="theme-line">Theme: &ldquo;${slate.theme}&rdquo;</p>`
    : '';

  let agendaRowsHtml = '';

  timeline.forEach((seg, idx) => {
    const prevCat = idx > 0 ? timeline[idx - 1].category : null;
    const needsGap = idx > 0 && (GAP_BEFORE.has(seg.category) || seg.category !== prevCat);

    if (needsGap) {
      agendaRowsHtml += `<tr class="seg-gap"><td colspan="3"></td></tr>\n`;
    }

    // Strip the end-time portion — show only start time (e.g. "10:45 AM" → "10:45 AM")
    const startTime = seg.timeStart.split('–')[0].trim();
    const acct = seg.accountability !== 'TBA' ? seg.accountability : '';

    agendaRowsHtml += `<tr class="seg-main">
  <td class="td-time">${startTime}</td>
  <td class="td-program">${seg.program}</td>
  <td class="td-acct">${acct}</td>
</tr>\n`;
  });

  return agendaTemplateHtml
    .replace('{{THEME_SECTION}}', themeHtml)
    .replace('{{AGENDA_ROWS}}', agendaRowsHtml);
}
