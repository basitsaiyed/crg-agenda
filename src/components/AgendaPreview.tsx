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
    <div className="print-page bg-white text-slate-900 shadow-xl rounded-lg mx-auto overflow-hidden border border-slate-300 font-sans max-w-[850px] transition-all">

      {/* ── Header: matches the original doc's teal banner ── */}
      <div className="bg-[#1a6b6b] text-white px-6 py-4 flex items-center justify-between gap-4">

        {/* Left: TI emblem + club name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* TI Emblem — using uploaded TMLogo.png */}
          <img 
            src={tmLogo} 
            alt="Toastmasters International" 
            className="w-12 h-12 rounded-full object-contain bg-white border-2 border-[#f59e0b] flex-shrink-0"
          />
          {/* Club name */}
          <div>
            <p className="text-[11px] font-bold tracking-widest text-teal-200 uppercase leading-none mb-0.5">
              {slate.clubName || 'CRG TOASTMASTERS'}
            </p>
            <p className="text-base font-extrabold tracking-wide uppercase text-white leading-tight font-serif">
              {slate.clubName || 'CRG TOASTMASTERS'}
            </p>
            <p className="text-[11px] text-amber-300 font-semibold italic leading-none mt-0.5">
              {slate.clubSubtitle || 'Run by Runners'}
            </p>
          </div>
        </div>

        {/* Right: time & venue */}
        <div className="text-right text-xs leading-snug text-white max-w-xs">
          <p className="font-bold text-sm leading-tight">
            Day: Sunday, Time: {slate.startTime} to {slate.endTime}
          </p>
          <p className="text-teal-100 mt-1 leading-snug text-[11px]">
            {slate.venue}
          </p>
        </div>
      </div>

      {/* Thin amber rule under header — matches the gold line in the doc */}
      <div className="h-1 bg-[#f59e0b]" />

      {/* ── Body: the document HTML ── */}
      <div
        className="agenda-html-container"
        dangerouslySetInnerHTML={{ __html: renderAgendaHtml(slate, timeline) }}
      />

      {/* Thin amber rule above footer */}
      <div className="h-1 bg-[#f59e0b]" />

      {/* ── Footer: subtle mission strip ── */}
      <div className="bg-[#1a6b6b] text-white px-6 py-3 flex items-start gap-3">
        <img
          src={tmLogo}
          alt="TI"
          className="w-7 h-7 rounded-full object-contain bg-white border border-amber-400 flex-shrink-0 mt-0.5"
        />
        <p className="text-[10px] leading-relaxed text-teal-100">
          <span className="font-bold text-amber-300">Club Mission: </span>
          {slate.clubMission ||
            'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth'}
        </p>
      </div>

    </div>
  );
};
