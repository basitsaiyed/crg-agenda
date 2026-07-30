/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MeetingSlate } from '../types';
import { calculateAgendaTimeline } from '../lib/agenda-utils';
import { renderAgendaHtml } from '../lib/render-agenda-html';
import tmLogo from '../../assets/TMLogo.png';

interface AgendaPreviewProps {
  slate: MeetingSlate;
}

// A4 at 96 dpi: 794 × 1123 px
const A4_W = 794;
const A4_H = 1123;

export const AgendaPreview: React.FC<AgendaPreviewProps> = ({ slate }) => {
  const timeline = calculateAgendaTimeline(slate);

  return (
    <div
      className="print-page bg-white mx-auto font-sans overflow-hidden"
      style={{
        width: A4_W,
        minHeight: A4_H,
        boxShadow: '0 4px 24px 0 rgba(30,58,95,0.12)',
        border: '1px solid #c8d6e5',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a2a5e 0%, #0d4a8a 55%, #1a6aaa 100%)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          minHeight: '110px',
          flexShrink: 0,
        }}
      >
        {/* Corner brackets */}
        <span style={{ position:'absolute', top:9,    left:9,  width:18, height:18, borderTop:'2px solid #6ab0d8',    borderLeft:'2px solid #6ab0d8'  }} />
        <span style={{ position:'absolute', top:9,    right:9, width:18, height:18, borderTop:'2px solid #6ab0d8',    borderRight:'2px solid #6ab0d8' }} />
        <span style={{ position:'absolute', bottom:9, left:9,  width:18, height:18, borderBottom:'2px solid #6ab0d8', borderLeft:'2px solid #6ab0d8'  }} />
        <span style={{ position:'absolute', bottom:9, right:9, width:18, height:18, borderBottom:'2px solid #6ab0d8', borderRight:'2px solid #6ab0d8' }} />

        {/* TM Logo */}
        <img
          src={tmLogo}
          alt="Toastmasters International"
          style={{ width: 130, height: 120, borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }}
        />

        {/* Club name + theme */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '26px', letterSpacing: '0.01em', lineHeight: 1.2 }}>
            {slate.clubName || 'Club Name'}&nbsp;{slate.meetingNumber || ''}
          </p>
          <p style={{ margin: '6px 0 0', color: '#a8cce8', fontWeight: 600, fontSize: '16px', lineHeight: 1.2 }}>
            {slate.theme ? `"${slate.theme}"` : (slate.clubSubtitle || 'Club Meeting Theme')}
          </p>
        </div>
      </div>

      {/* Teal accent rule */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#0d7abf,#16a8d4)', flexShrink: 0 }} />

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Left sidebar */}
        <div
          style={{
            width: 195,
            minWidth: 195,
            borderRight: '1px solid #dce6f0',
            padding: '12px 12px 12px 14px',
            fontSize: '8.5pt',
            fontFamily: 'Arial, sans-serif',
            color: '#111',
            lineHeight: 1.45,
            overflowWrap: 'break-word',
          }}
        >
          {/* Date */}
          <p style={{ fontWeight: 700, margin: '0 0 10px', fontSize: '9pt' }}>
            {slate.date || 'Month, Day YYYY'}
          </p>

          {/* Officers */}
          {slate.officers.map((off, i) => (
            <div key={i} style={{ marginBottom: '7px' }}>
              <p style={{ fontWeight: 700, color: '#0a3d7a', margin: 0, fontSize: '8.5pt' }}>{off.position}</p>
              <p style={{ margin: 0, fontSize: '8.5pt' }}>{off.name || 'TBD'}</p>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #dce6f0', margin: '10px 0' }} />

          {/* Meeting info */}
          <p style={{ margin: '0 0 6px' }}>
            We meet every Sunday from {slate.startTime} to {slate.endTime}
          </p>
          {slate.venue && (
            <p style={{ margin: '0 0 6px' }}>{slate.venue}</p>
          )}

          <div style={{ borderTop: '1px solid #dce6f0', margin: '10px 0' }} />

          {/* Club Mission */}
          <p style={{ fontWeight: 700, color: '#0a3d7a', margin: '0 0 4px', fontSize: '8.5pt' }}>Club Mission</p>
          <p style={{ margin: 0, fontSize: '8pt', lineHeight: 1.5 }}>
            {slate.clubMission ||
              'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.'}
          </p>
        </div>

        {/* Right: agenda */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div
            className="agenda-html-container"
            dangerouslySetInnerHTML={{ __html: renderAgendaHtml(slate, timeline) }}
          />
        </div>
      </div>

      {/* Bottom teal rule */}
      <div style={{ height: 4, background: 'linear-gradient(90deg,#0d7abf,#16a8d4)', flexShrink: 0 }} />
    </div>
  );
};
