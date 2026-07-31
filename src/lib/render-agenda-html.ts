// This file is kept for any external consumers.
// The AgendaPreview component renders directly via React now.
import { MeetingSlate, AgendaSegment } from '../types';

export function renderAgendaRows(
  slate: MeetingSlate,
  timeline: AgendaSegment[]
): { rowsHtml: string; themeHtml: string } {
  const themeHtml = slate.theme
    ? `Theme: \u201c${slate.theme}\u201d`
    : '';

  let rowsHtml = '';
  timeline.forEach((seg, idx) => {
    if (idx > 0) rowsHtml += `<tr><td colspan="3" style="height:5pt;padding:0;border:none"></td></tr>`;
    const t = seg.timeStart.split('–')[0].trim();
    const a = seg.accountability !== 'TBA' ? seg.accountability : '';
    rowsHtml += `<tr>
      <td style="font-weight:700;font-size:10.5pt;color:#111;padding:3pt 7pt 0 0;vertical-align:top;white-space:nowrap;font-family:Arial,sans-serif">${t}</td>
      <td style="font-weight:700;font-size:10.5pt;color:#111;padding:3pt 3pt 0 0;vertical-align:top;word-break:break-word;font-family:Arial,sans-serif">${seg.program}</td>
      <td style="font-weight:400;font-size:10.5pt;color:#111;padding:3pt 0 0 0;vertical-align:top;text-align:right;word-break:break-word;font-family:Arial,sans-serif">${a}</td>
    </tr>`;
    seg.subItems?.forEach(sub => {
      rowsHtml += `<tr>
        <td style="font-size:10.5pt;padding:0 7pt 0 0;vertical-align:top;font-family:Arial,sans-serif"></td>
        <td style="font-weight:400;font-size:10.5pt;color:#333;padding:0 3pt 0 11pt;vertical-align:top;word-break:break-word;font-family:Arial,sans-serif">${sub.program}</td>
        <td style="font-weight:400;font-size:10.5pt;color:#333;padding:0;vertical-align:top;text-align:right;word-break:break-word;font-family:Arial,sans-serif">${sub.accountability ?? ''}</td>
      </tr>`;
    });
  });
  return { rowsHtml, themeHtml };
}

export function renderAgendaHtml(slate: MeetingSlate, timeline: AgendaSegment[]): string {
  const { rowsHtml, themeHtml } = renderAgendaRows(slate, timeline);
  return themeHtml + rowsHtml;
}
