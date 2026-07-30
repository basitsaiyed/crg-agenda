import agendaTemplateHtml from '../templates/crg-agenda-structure.html?raw';
import { MeetingSlate, AgendaSegment } from '../types';

export function renderAgendaHtml(slate: MeetingSlate, timeline: AgendaSegment[]): string {
  const themeHtml = slate.theme
    ? `<p class="theme-line">Theme: &ldquo;${slate.theme}&rdquo;</p>`
    : '';

  let agendaRowsHtml = '';

  timeline.forEach((seg, idx) => {
    // Gap row between every section
    if (idx > 0) {
      agendaRowsHtml += `<tr class="seg-gap"><td colspan="3"></td></tr>\n`;
    }

    // Start time only (strip end time range)
    const startTime = seg.timeStart.split('–')[0].trim();
    const acct = seg.accountability !== 'TBA' ? seg.accountability : '';

    // Header row — bold time + bold program title + accountability
    agendaRowsHtml += `<tr class="seg-main">
  <td class="td-time">${startTime}</td>
  <td class="td-program">${seg.program}</td>
  <td class="td-acct">${acct}</td>
</tr>\n`;

    // Sub-item rows — indented, normal weight, name on right
    if (seg.subItems && seg.subItems.length > 0) {
      seg.subItems.forEach(sub => {
        const subAcct = sub.accountability ?? '';
        agendaRowsHtml += `<tr class="seg-sub">
  <td class="td-time"></td>
  <td class="td-program">${sub.program}</td>
  <td class="td-acct">${subAcct}</td>
</tr>\n`;
      });
    }
  });

  return agendaTemplateHtml
    .replace('{{THEME_SECTION}}', themeHtml)
    .replace('{{AGENDA_ROWS}}', agendaRowsHtml);
}
