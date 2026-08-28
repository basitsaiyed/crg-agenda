/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { MeetingSlate, AgendaSegment } from '../types';
import { calculateAgendaTimeline } from '../lib/agenda-utils';
import tmLogo from '../../assets/TMLogo.png';

// ─── Constants — defined first so every component below can reference them ───
const A4_W = 794;
const A4_H = 1123;
const HEADER_H     = 136;
const TEAL_H       = 4;
const BODY_PAD     = 50;
const BOTTOM_MARGIN = 80;
const USABLE_H     = A4_H - HEADER_H - TEAL_H - BODY_PAD - BOTTOM_MARGIN;
const SIDEBAR_W    = 220;

const LINE_H        = 20;
const SEG_GAP       = 5;
const ROW_PAD_TOP   = 4;
const TABLE_PAD_TOP = 20;
const THEME_LINE_H  = 24;
const CHAR_W        = 5.8;

// ─── Responsive scale wrapper ─────────────────────────────────────────────────
// The inner content is always rendered at A4_W (794px). The outer wrapper
// measures its own pixel width and applies a CSS scale() so the content
// visually shrinks to fit — without changing layout dimensions.
const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledH, setScaledH] = useState<number | undefined>(undefined);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const recalc = () => {
      // clientWidth of the outer div = available container space
      const w = outer.clientWidth;
      if (!w) return;
      const s = Math.min(1, w / A4_W);
      setScale(s);

      // After a scale transform, the inner div still occupies A4_W in layout
      // space (transforms don't affect layout flow). We must manually set the
      // outer height to the *visual* (scaled) height so nothing is clipped or
      // leaves dead space.
      const inner = outer.firstElementChild as HTMLElement | null;
      if (inner) {
        const naturalH = inner.scrollHeight;
        setScaledH(naturalH * s);
      }
    };

    recalc();

    const ro = new ResizeObserver(recalc);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        overflow: 'hidden',
        height: scaledH,
      }}
    >
      <div
        style={{
          width: A4_W,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Height estimator ─────────────────────────────────────────────────────────
function estimateSegmentHeight(seg: AgendaSegment, colWidth: number): number {
  const lines = (text: string, width: number) =>
    Math.max(1, Math.ceil(text.length / Math.max(1, Math.floor(width / CHAR_W))));

  const progLines = lines(seg.program, colWidth);
  const acctLines = lines(seg.accountability !== 'TBA' ? seg.accountability : '', 112);
  const mainH = Math.max(progLines, acctLines) * LINE_H + ROW_PAD_TOP;

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
  const programColWidth = A4_W - SIDEBAR_W - 36 - 86 - 112 - 8;

  const result: AgendaSegment[][] = [];
  let cur: AgendaSegment[] = [];
  let used = TABLE_PAD_TOP + (showTheme ? THEME_LINE_H : 0);

  for (const seg of timeline) {
    const h = estimateSegmentHeight(seg, programColWidth);
    const gap = cur.length > 0 ? SEG_GAP : 0;
    const needed = h + gap;

    if (used + needed > usableH && cur.length > 0) {
      result.push(cur);
      cur = [seg];
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
    <div style={{ flexShrink: 0 }}>
      <AgendaHeader slate={slate} />
      <TealRule />
    </div>
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

// ─── Main export ──────────────────────────────────────────────────────────────
export const AgendaPreview: React.FC<{ slate: MeetingSlate }> = ({ slate }) => {
  const timeline = calculateAgendaTimeline(slate);
  const themeHtml = slate.theme
    ? `Theme: \u201c${slate.theme}\u201d`
    : `Theme: \u201cTo Be Announced\u201d`;

  const pages = buildPageSplits(timeline, USABLE_H, !!slate.theme);

  return (
    <ScaledPreview>
      <div
        className="agenda-screen-only"
        style={{ flexDirection: 'column', gap: 24, width: A4_W }}
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
