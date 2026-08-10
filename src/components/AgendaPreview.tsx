/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { MeetingSlate, AgendaSegment } from '../types';
import { calculateAgendaTimeline } from '../lib/agenda-utils';
import tmLogo from '../../assets/TMLogo.png';

// ─── Responsive scale wrapper ─────────────────────────────────────────────────
// Renders children at A4_W then scales them down to fit the available container.
const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const available = el.parentElement?.clientWidth ?? el.clientWidth;
      const ratio = available / A4_W;
      setScale(ratio < 1 ? ratio : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el.parentElement ?? el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        // shrink the outer height to match the scaled content so no dead space below
        height: scale < 1 ? `calc(${scale} * (100% + 0px))` : undefined,
      }}
    >
      <div
        style={{
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          // when scaled down the layout space is still A4_W wide — compensate
          marginLeft: scale < 1 ? `calc((${scale} - 1) * ${A4_W}px / 2)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface AgendaPreviewProps {
  slate: MeetingSlate;
}

const A4_W = 794;
const A4_H = 1123;
const HEADER_H  = 136;  // blue header
const TEAL_H    = 4;    // teal rule
const BODY_PAD  = 50;   // card padding top (12) + bottom (24)
const BOTTOM_MARGIN = 80; // conservative bottom guard — ensures estimator splits before card edge
const USABLE_H  = A4_H - HEADER_H - TEAL_H - BODY_PAD - BOTTOM_MARGIN; // ~893px
const SIDEBAR_W = 220;

// ─── Data-driven height estimator ────────────────────────────────────────────
// Font: Arial 10.5pt. At 96dpi: 10.5pt * (4/3) = 14px. line-height 1.4 → 19.6px per line.
// We use a conservative char-width (5.8px) so wrapping is never underestimated.
const LINE_H        = 20;   // px per line — rounded up from 19.6 for safety
const SEG_GAP       = 5;    // gap row between segments
const ROW_PAD_TOP   = 4;    // padding-top on the main row (3pt ≈ 4px)
const TABLE_PAD_TOP = 20;   // agenda-table-area top padding (first segment only, per page)
const THEME_LINE_H  = 24;   // theme italic line height including bottom margin (page 1 only)
const CHAR_W        = 5.8;  // conservative px-per-char for Arial 10.5pt

function estimateSegmentHeight(seg: AgendaSegment, colWidth: number): number {
  const lines = (text: string, width: number) =>
    Math.max(1, Math.ceil(text.length / Math.max(1, Math.floor(width / CHAR_W))));

  // Main row — program column wraps, accountability column (112px) can also wrap
  const progLines = lines(seg.program, colWidth);
  const acctLines = lines(seg.accountability !== 'TBA' ? seg.accountability : '', 112);
  const mainLines = Math.max(progLines, acctLines);
  const mainH = mainLines * LINE_H + ROW_PAD_TOP;

  // Sub-items — program indented 11px, accountability in 112px column
  const subProgW = colWidth - 11;
  const subH = (seg.subItems ?? []).reduce((acc, sub) => {
    const sProgLines = lines(sub.program, subProgW);
    const sAcctLines = lines(sub.accountability ?? '', 112);
    return acc + Math.max(sProgLines, sAcctLines) * LINE_H;
  }, 0);

  return mainH + subH;
}

function buildPageSplits(
  timeline: AgendaSegment[],
  usableH: number,
  showTheme: boolean,
): AgendaSegment[][] {
  // program col = A4_W − sidebar(220) − table padding(16+20) − time col(86) − acct col(112) − col gaps(8)
  const programColWidth = A4_W - SIDEBAR_W - 36 - 86 - 112 - 8; // ~332px

  const result: AgendaSegment[][] = [];
  let cur: AgendaSegment[] = [];
  // Each page starts with TABLE_PAD_TOP already consumed.
  // Page 1 also has the theme line.
  let used = TABLE_PAD_TOP + (showTheme ? THEME_LINE_H : 0);

  for (const seg of timeline) {
    const h = estimateSegmentHeight(seg, programColWidth);
    const gap = cur.length > 0 ? SEG_GAP : 0;
    const needed = h + gap;

    if (used + needed > usableH && cur.length > 0) {
      result.push(cur);
      cur = [seg];
      // Subsequent pages: just TABLE_PAD_TOP, no theme line
      used = TABLE_PAD_TOP + h;
    } else {
      cur.push(seg);
      used += needed;
    }
  }

  if (cur.length > 0) result.push(cur);
  return result.length > 0 ? result : [timeline];
}

// ─── Header ──────────────────────────────────────────────────────────────────
const AgendaHeader: React.FC<{ slate: MeetingSlate }> = ({ slate }) => {
  const clubLine = `${slate.clubName || 'Club Name'}${slate.clubNumber ? ` · ${slate.clubNumber}` : ''}`;
  const meetingPart = slate.meetingNumber ? ` · Meeting ${slate.meetingNumber}` : '';
  const subLine = slate.theme
    ? `"${slate.theme}"${meetingPart}`
    : `${slate.clubSubtitle || 'Run by Runners'}${meetingPart}`;

  return (
    <div className="agenda-header">
      <span className="agenda-header__corner agenda-header__corner--tl" />
      <span className="agenda-header__corner agenda-header__corner--tr" />
      <span className="agenda-header__corner agenda-header__corner--bl" />
      <span className="agenda-header__corner agenda-header__corner--br" />
      <img src={tmLogo} alt="Toastmasters" className="agenda-header__logo" />
      <div className="agenda-header__text">
        <p className="agenda-header__club-name">{clubLine}</p>
        <p className="agenda-header__sub-line">{subLine}</p>
      </div>
    </div>
  );
};

// ─── Teal rule ───────────────────────────────────────────────────────────────
const TealRule: React.FC = () => <div className="agenda-teal-rule" />;

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const SidebarContent: React.FC<{ slate: MeetingSlate }> = ({ slate }) => (
  <div className="agenda-sidebar__inner">
    <p className="agenda-sidebar__date">{slate.date || 'Month, Day YYYY'}</p>

    {slate.officers.map((off, i) => (
      <div key={i} className="agenda-sidebar__officer">
        <p className="agenda-sidebar__officer-title">{off.position}</p>
        <p className="agenda-sidebar__officer-name">{off.name || 'TBD'}</p>
      </div>
    ))}

    <div className="agenda-sidebar__divider" />

    <p className="agenda-sidebar__meet-time">
      We meet every Sunday from {slate.startTime} to {slate.endTime}
    </p>

    <p className="agenda-sidebar__section-title">Location:</p>
    <p className="agenda-sidebar__venue">
      {slate.venue || 'Training Room, First Floor, Gandhinagar GIFT City Fire Department'}
    </p>
    <a
      href={slate.venueUrl || '#'}
      target="_blank"
      rel="noreferrer"
      className="agenda-sidebar__venue-link"
    >
      Find us on Toastmasters.org
    </a>

    <div className="agenda-sidebar__divider" />

    <p className="agenda-sidebar__section-title">Club Mission</p>
    <p className="agenda-sidebar__mission">
      {slate.clubMission ||
        'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth.'}
    </p>
  </div>
);

// ─── Agenda table ─────────────────────────────────────────────────────────────
const AgendaTable: React.FC<{ segments: AgendaSegment[]; themeHtml: string }> = ({
  segments,
  themeHtml,
}) => (
  <div className="agenda-table-area">
    {themeHtml && <p className="agenda-theme-line">{themeHtml}</p>}
    <table className="agenda-table">
      <colgroup>
        <col style={{ width: 86 }} />
        <col />
        <col style={{ width: 112 }} />
      </colgroup>
      <tbody>
        {segments.map((seg, idx) => (
          <React.Fragment key={seg.id}>
            {idx > 0 && (
              <tr className="agenda-row-gap">
                <td colSpan={3} />
              </tr>
            )}
            <tr className="agenda-row-main">
              <td className="td-time">{seg.timeStart.split('–')[0].trim()}</td>
              <td className="td-program">{seg.program}</td>
              <td className="td-acct">
                {seg.accountability !== 'TBA' ? seg.accountability : ''}
              </td>
            </tr>
            {seg.subItems?.map((sub, si) => (
              <tr key={si} className="agenda-row-sub">
                <td className="td-time" />
                <td className="td-program">{sub.program}</td>
                <td className="td-acct">{sub.accountability ?? ''}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Page card ────────────────────────────────────────────────────────────────
const PageCard: React.FC<{
  slate: MeetingSlate;
  segments: AgendaSegment[];
  themeHtml: string;
  pageNum: number;
  totalPages: number;
}> = ({ slate, segments, themeHtml, pageNum, totalPages }) => (
  <div className="agenda-print-page agenda-page-card">
    {/* Full-width header */}
    <div style={{ flexShrink: 0 }}>
      <AgendaHeader slate={slate} />
      <TealRule />
    </div>

    {/* Body: sidebar + agenda table */}
    <div className="agenda-body">
      <div className="agenda-sidebar">
        <SidebarContent slate={slate} />
      </div>
      <AgendaTable segments={segments} themeHtml={pageNum === 1 ? themeHtml : ''} />
    </div>

    <span className="agenda-page-num">
      {pageNum} / {totalPages}
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const AgendaPreview: React.FC<AgendaPreviewProps> = ({ slate }) => {
  const timeline = calculateAgendaTimeline(slate);
  const themeHtml = slate.theme
    ? `Theme: \u201c${slate.theme}\u201d`
    : `Theme: \u201cTo Be Announced\u201d`;

  // Pure data-driven split — no DOM reads, no timers, no fudge factors
  const pages = buildPageSplits(timeline, USABLE_H, !!slate.theme);

  return (
    <ScaledPreview>
      <div
        className="agenda-screen-only"
        style={{ flexDirection: 'column', gap: 24, width: A4_W, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {pages.map((pageSegs, i) => (
          <PageCard
            key={i}
            slate={slate}
            segments={pageSegs}
            themeHtml={themeHtml}
            pageNum={i + 1}
            totalPages={pages.length}
          />
        ))}
      </div>
    </ScaledPreview>
  );
};
