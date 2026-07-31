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
const SIDEBAR_W = 205;

// ─── Header (right-column content) ──────────────────────────────────────────
const AgendaHeader: React.FC<{ slate: MeetingSlate }> = ({ slate }) => {
  const clubLine = `${slate.clubName || 'Club Name'} ${slate.meetingNumber || ''}`.trim();
  const subLine  = slate.theme ? `"${slate.theme}"` : (slate.clubSubtitle || 'Run by Runners');
  return (
    <div style={{
      background: 'linear-gradient(135deg,#1a6aaa 0%,#0d4a8a 45%,#0a2a5e 100%)',
      padding: '20px 22px 20px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      position: 'relative',
      minHeight: 120,
      boxSizing: 'border-box',
    }}>
      <span style={{ position:'absolute', top:8, left:8,    width:16, height:16, borderTop:'2px solid #6ab0d8', borderLeft:'2px solid #6ab0d8'    }} />
      <span style={{ position:'absolute', top:8, right:8,   width:16, height:16, borderTop:'2px solid #6ab0d8', borderRight:'2px solid #6ab0d8'   }} />
      <span style={{ position:'absolute', bottom:8, left:8,  width:16, height:16, borderBottom:'2px solid #6ab0d8', borderLeft:'2px solid #6ab0d8'  }} />
      <span style={{ position:'absolute', bottom:8, right:8, width:16, height:16, borderBottom:'2px solid #6ab0d8', borderRight:'2px solid #6ab0d8' }} />
      <img src={tmLogo} alt="Toastmasters"
        style={{ width:84, height:84, borderRadius:'50%', objectFit:'contain', flexShrink:0, marginLeft:14 }} />
      <div style={{ flex:1, textAlign:'right' }}>
        <p style={{ margin:0, color:'#fff', fontWeight:700, fontSize:22, fontFamily:'Arial,sans-serif', lineHeight:1.2 }}>{clubLine}</p>
        <p style={{ margin:'4px 0 0', color:'#a8cce8', fontWeight:600, fontSize:14, fontFamily:'Arial,sans-serif', lineHeight:1.2 }}>{subLine}</p>
      </div>
    </div>
  );
};

// ─── Teal rule ───────────────────────────────────────────────────────────────
const TealRule: React.FC = () => (
  <div style={{ height:4, background:'linear-gradient(90deg,#0d7abf,#16a8d4)' }} />
);

// ─── Sidebar content ─────────────────────────────────────────────────────────
const SidebarContent: React.FC<{ slate: MeetingSlate }> = ({ slate }) => (
  <div style={{ padding:'12px 11px 18px 20px', fontSize:'10pt', fontFamily:'Arial,sans-serif', color:'#111', lineHeight:1.45, overflowWrap:'break-word' }}>
    <p style={{ fontWeight:700, margin:'0 0 12px', fontSize:'11.5pt' }}>{slate.date || 'Month, Day YYYY'}</p>
    {slate.officers.map((off, i) => (
      <div key={i} style={{ marginBottom:10 }}>
        <p style={{ fontWeight:700, color:'#0a3d7a', margin:0, fontSize:'10.5pt' }}>{off.position}</p>
        <p style={{ margin:'1px 0 0 2px', fontSize:'10pt' }}>{off.name || 'TBD'}</p>
      </div>
    ))}
    <div style={{ borderTop:'1px solid #dce6f0', margin:'8px 0' }} />
    <p style={{ margin:'0 0 12px', fontSize:'10pt' }}>We meet every Sunday from {slate.startTime} to {slate.endTime}</p>
    <p style={{ fontWeight:700, color:'#0a3d7a', margin:'0 0 2px', fontSize:'10.5pt' }}>Location:</p>
    <p style={{ margin:'0 0 4px', fontSize:'10pt', lineHeight:1.5 }}>{slate.venue || 'Training Room, First Floor, Gandhinagar GIFT City Fire Department'}</p>
    <a href={slate.venueUrl || '#'} target="_blank" rel="noreferrer"
      style={{ display:'block', margin:'0 0 5px', color:'#1a5fa8', fontSize:'9pt', wordBreak:'break-all' }}>
      Find us on Toastmasters.org
    </a>
    <div style={{ borderTop:'1px solid #dce6f0', margin:'8px 0' }} />
    <p style={{ fontWeight:700, color:'#0a3d7a', margin:'0 0 3px', fontSize:'10.5pt' }}>Club Mission</p>
    <p style={{ margin:0, fontSize:'10pt', lineHeight:1.5 }}>
      {slate.clubMission || 'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth.'}
    </p>
  </div>
);

// ─── Agenda rows (screen preview use) ────────────────────────────────────────
const AgendaTable: React.FC<{ segments: AgendaSegment[]; themeHtml: string }> = ({ segments, themeHtml }) => (
  <div style={{ flex:1, minWidth:0, padding:'12px 20px 18px 16px', fontFamily:'Arial,sans-serif' }}>
    {themeHtml && (
      <p style={{ fontStyle:'italic', margin:'0 0 7pt', color:'#444', fontSize:'10.5pt' }}>{themeHtml}</p>
    )}
    <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
      <colgroup>
        <col style={{ width:86 }} />
        <col />
        <col style={{ width:112 }} />
      </colgroup>
      <tbody>
        {segments.map((seg, idx) => (
          <React.Fragment key={seg.id}>
            {idx > 0 && <tr><td colSpan={3} style={{ height:5, padding:0, border:'none' }} /></tr>}
            <tr>
              <td style={{ fontWeight:700, fontSize:'10.5pt', color:'#111', padding:'3pt 7pt 0 0', verticalAlign:'top', whiteSpace:'nowrap' }}>
                {seg.timeStart.split('–')[0].trim()}
              </td>
              <td style={{ fontWeight:700, fontSize:'10.5pt', color:'#111', padding:'3pt 3pt 0 0', verticalAlign:'top', wordBreak:'break-word' }}>
                {seg.program}
              </td>
              <td style={{ fontWeight:400, fontSize:'10.5pt', color:'#111', padding:'3pt 0 0 0', verticalAlign:'top', textAlign:'right', wordBreak:'break-word' }}>
                {seg.accountability !== 'TBA' ? seg.accountability : ''}
              </td>
            </tr>
            {seg.subItems?.map((sub, si) => (
              <tr key={si}>
                <td style={{ padding:'0 7pt 0 0', verticalAlign:'top' }} />
                <td style={{ fontWeight:400, fontSize:'10.5pt', color:'#333', padding:'0 3pt 0 11pt', verticalAlign:'top', wordBreak:'break-word' }}>
                  {sub.program}
                </td>
                <td style={{ fontWeight:400, fontSize:'10.5pt', color:'#333', padding:0, verticalAlign:'top', textAlign:'right', wordBreak:'break-word' }}>
                  {sub.accountability ?? ''}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Screen page card ─────────────────────────────────────────────────────────
const PageCard: React.FC<{
  slate: MeetingSlate;
  segments: AgendaSegment[];
  themeHtml: string;
  pageNum: number;
  totalPages: number;
}> = ({ slate, segments, themeHtml, pageNum, totalPages }) => (
  <div className="agenda-print-page" style={{
    width: A4_W, height: A4_H, background:'#fff',
    boxShadow:'0 4px 28px 0 rgba(30,58,95,0.13)', border:'1px solid #c8d6e5',
    borderRadius:3, display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, position:'relative', padding:'12px 12px 24px 12px'
  }}>
    {/* Full-width header */}
    <div style={{ flexShrink:0 }}>
      <AgendaHeader slate={slate} />
      <TealRule />
    </div>
    {/* Body */}
    <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>
      <div style={{ width:SIDEBAR_W, minWidth:SIDEBAR_W, flexShrink:0, borderRight:'1px solid #dce6f0' }}>
        <SidebarContent slate={slate} />
      </div>
      <AgendaTable segments={segments} themeHtml={pageNum === 1 ? themeHtml : ''} />
    </div>
    <div style={{ position:'absolute', bottom:10, right:14, fontSize:'8pt', color:'#aaa', fontFamily:'Arial,sans-serif' }}>
      {pageNum} / {totalPages}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const AgendaPreview: React.FC<AgendaPreviewProps> = ({ slate }) => {
  const timeline = calculateAgendaTimeline(slate);
  const themeHtml = slate.theme ? `Theme: \u201c${slate.theme}\u201d` : '';

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<AgendaSegment[][]>([timeline]);

  const HEADER_H = 128;
  const BODY_PAD = 50;   // top (12) + bottom (24) padding + page-number area
  const USABLE_H = A4_H - HEADER_H - BODY_PAD;

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
      const needed = h + (cur.length > 0 ? 5 : 0);
      if (used + needed > USABLE_H && cur.length > 0) {
        result.push(cur); cur = [timeline[i]]; used = h;
      } else {
        cur.push(timeline[i]); used += needed;
      }
    }
    if (cur.length > 0) result.push(cur);
    setPages(result.length > 0 ? result : [timeline]);
  }, [timeline, USABLE_H]);

  useEffect(() => {
    const id = setTimeout(buildPages, 80);
    return () => clearTimeout(id);
  }, [buildPages]);

  return (
    <>
      {/* Measurement sandbox */}
      <div ref={measureRef}
        style={{ position:'fixed', top:0, left:-9999, width: A4_W - SIDEBAR_W - 42,
          visibility:'hidden', pointerEvents:'none', fontFamily:'Arial,sans-serif', fontSize:'10.5pt' }}
        aria-hidden="true"
      >
        {timeline.map(seg => (
          <div key={seg.id} data-seg={seg.id} style={{ padding:'3pt 0' }}>
            <div style={{ fontWeight:700 }}>{seg.program}</div>
            {seg.subItems?.map((sub, i) => <div key={i} style={{ paddingLeft:11 }}>{sub.program}</div>)}
          </div>
        ))}
      </div>

      {/* Screen preview — also used for print */}
      <div className="agenda-screen-only"
        style={{ display:'flex', flexDirection:'column', gap:24, width:A4_W, marginLeft:'auto', marginRight:'auto' }}
      >
        {pages.map((pageSegs, i) => (
          <PageCard key={i} slate={slate} segments={pageSegs} themeHtml={themeHtml}
            pageNum={i+1} totalPages={pages.length} />
        ))}
      </div>
    </>
  );
};
