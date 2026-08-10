/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MeetingSlate, AgendaSegment } from '../types';
import { calculateAgendaTimeline } from '../lib/agenda-utils';
import tmLogo from '../../assets/TMLogo.png';

interface AgendaPreviewProps {
  slate: MeetingSlate;
}

const A4_W = 794;
const A4_H = 1123;
const HEADER_H = 136;
const BODY_PAD = 50; // top (12) + bottom (24) card padding
const USABLE_H = A4_H - HEADER_H - BODY_PAD;
const SIDEBAR_W = 220;

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

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<AgendaSegment[][]>([timeline]);

  const buildPages = useCallback(() => {
    const container = measureRef.current;
    if (!container) return;
    const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-seg]'));
    if (rows.length === 0) return;

    const result: AgendaSegment[][] = [];
    let cur: AgendaSegment[] = [];
    let used = 0;

    for (let i = 0; i < timeline.length; i++) {
      const h = rows[i]?.getBoundingClientRect().height || rows[i]?.offsetHeight || 0;
      const gap = cur.length > 0 ? 5 : 0;
      const buffer = 6;
      const needed = h + gap + buffer;

      if (used + needed > USABLE_H && cur.length > 0) {
        result.push(cur);
        cur = [timeline[i]];
        used = h + buffer;
      } else {
        cur.push(timeline[i]);
        used += needed;
      }
    }

    if (cur.length > 0) result.push(cur);
    setPages(result.length > 0 ? result : [timeline]);
  }, [timeline]);

  useEffect(() => {
    const id = setTimeout(buildPages, 80);
    return () => clearTimeout(id);
  }, [buildPages]);

  return (
    <>
      {/* Off-screen measurement sandbox */}
      <div
        ref={measureRef}
        className="agenda-measure-sandbox"
        style={{ width: A4_W - SIDEBAR_W - 42 }}
        aria-hidden="true"
      >
        {timeline.map(seg => (
          <div key={seg.id} data-seg={seg.id} className="agenda-measure-seg">
            <div className="agenda-measure-seg__title">{seg.program}</div>
            {seg.subItems?.map((sub, i) => (
              <div key={i} className="agenda-measure-seg__sub">{sub.program}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Screen preview — also drives print output */}
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
    </>
  );
};
