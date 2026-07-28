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

export const AgendaPreview: React.FC<AgendaPreviewProps> = ({ slate }) => {
  const timeline = calculateAgendaTimeline(slate);

  return (
    <div
      className="print-page bg-white mx-auto overflow-hidden font-sans max-w-[850px] transition-all"
      style={{
        boxShadow: '0 4px 24px 0 rgba(30,58,95,0.10)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--navy)' }}
      >
        {/* Left: logo + club name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src={tmLogo}
            alt="Toastmasters International"
            className="w-30 h-30 rounded-full object-contain flex-shrink-0"
          />
          <div>
            <p
              className="text-[10px] font-semibold tracking-widest uppercase leading-none mb-0.5"
              style={{ color: '#a8c4e0' }}
            >
              {slate.clubName || 'CRG TOASTMASTERS'}
            </p>
            <p className="text-base font-extrabold tracking-wide uppercase text-white leading-tight font-serif">
              {slate.clubName || 'CRG TOASTMASTERS'}
            </p>
            <p
              className="text-[11px] font-semibold italic leading-none mt-0.5"
              style={{ color: '#e8be6a' }}
            >
              {slate.clubSubtitle || 'Run by Runners'}
            </p>
          </div>
        </div>

        {/* Right: time & venue */}
        <div className="text-right leading-snug max-w-xs">
          <p className="font-bold text-sm text-white leading-tight">
            Day: Sunday, Time: {slate.startTime} to {slate.endTime}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: '#a8c4e0' }}>
            {slate.venue}
          </p>
        </div>
      </div>

      {/* Gold rule */}
      <div className="h-[3px]" style={{ backgroundColor: 'var(--gold)' }} />

      {/* ── Body ── */}
      <div className="print-body-content">
        <div
          className="agenda-html-container"
          dangerouslySetInnerHTML={{ __html: renderAgendaHtml(slate, timeline) }}
        />
      </div>

      {/* Gold rule */}
      <div className="h-[3px]" style={{ backgroundColor: 'var(--gold)' }} />

      {/* ── Footer ── */}
      <div
        className="px-6 py-3 flex items-start gap-3"
        style={{ backgroundColor: 'var(--navy)' }}
      >
        <img
          src={tmLogo}
          alt="TI"
          className="w-6 h-6 rounded-full object-contain flex-shrink-0 mt-0.5"
        />
        <p className="text-[10px] leading-relaxed" style={{ color: '#a8c4e0' }}>
          <span className="font-bold" style={{ color: '#e8be6a' }}>Club Mission: </span>
          {slate.clubMission ||
            'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth'}
        </p>
      </div>
    </div>
  );
};
