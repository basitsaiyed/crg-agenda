/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MeetingSlate, TemplateStyle, AgendaSegment } from '../types';
import { calculateAgendaTimeline } from '../lib/agenda-utils';
import { renderAgendaHtml } from '../lib/render-agenda-html';

interface AgendaPreviewProps {
  slate: MeetingSlate;
  templateStyle: TemplateStyle;
}

export const AgendaPreview: React.FC<AgendaPreviewProps> = ({ slate, templateStyle }) => {
  const timeline = calculateAgendaTimeline(slate);

  // Helper to format date with Sunday if missing
  const formattedDate = slate.date.toLowerCase().includes('sunday') 
    ? slate.date 
    : `Sunday, ${slate.date}`;

  // RENDER CRG CLASSIC TEMPLATE (Official Match)
  if (templateStyle === 'crg-classic') {
    return (
      <div className="print-page bg-white text-slate-900 shadow-2xl rounded-2xl mx-auto overflow-hidden border border-slate-300 font-sans max-w-[850px] transition-all">
        {/* Header Banner (Exact CRG Teal & Navy match) */}
        <div className="bg-gradient-to-r from-[#004165] via-[#005a7d] to-[#008080] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-[#f59e0b]">
          {/* Emblem */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center p-2 shadow-inner border-2 border-[#f59e0b] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#004165] text-white flex flex-col items-center justify-center font-serif border border-white/20">
                <span className="text-[10px] font-bold tracking-tighter leading-none text-amber-400">TOASTMASTERS</span>
                <span className="text-sm font-extrabold tracking-wider text-white">TI</span>
                <span className="text-[8px] tracking-widest text-sky-200">INTL</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-white font-serif drop-shadow-sm">
                {slate.clubName || 'CRG TOASTMASTERS'}
              </h1>
              <p className="text-amber-300 font-bold text-sm sm:text-base tracking-wide italic">
                {slate.clubSubtitle || 'Run by Runners'}
              </p>
            </div>
          </div>

          {/* Time & Venue Subtitle right-aligned */}
          <div className="text-center sm:text-right text-xs sm:text-sm space-y-1 text-sky-100 font-medium">
            <p className="font-bold text-white text-sm">
              Day: Sunday, Time: {slate.startTime} to {slate.endTime}
            </p>
            <p className="max-w-xs sm:max-w-md leading-tight text-sky-200 text-xs">
              {slate.venue}
            </p>
          </div>
        </div>

        {/* Meticulous Reference HTML Body via Imported HTML Template */}
        <div 
          className="agenda-html-container overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderAgendaHtml(slate, timeline) }}
        />

        {/* Footer Mission Banner (Exact Navy/Teal Match) */}
        <div className="bg-gradient-to-r from-[#004165] via-[#006666] to-[#008080] text-white p-6 flex items-center space-x-4 border-t-4 border-[#f59e0b]">
          <div className="w-12 h-12 rounded-full bg-white text-[#004165] font-bold flex items-center justify-center p-1 border-2 border-amber-400 flex-shrink-0 text-xs text-center leading-tight shadow-md font-serif">
            <span>TI</span>
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-white">
            <span className="font-bold text-amber-300">Club Mission:</span>{' '}
            {slate.clubMission ||
              'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self confidence and personal growth'}
          </p>
        </div>
      </div>
    );
  }

  // RENDER MODERN EXECUTIVE TEMPLATE
  if (templateStyle === 'modern-executive') {
    return (
      <div className="print-page bg-white text-slate-800 shadow-xl rounded-3xl mx-auto overflow-hidden border border-slate-200 max-w-[850px] p-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-6 gap-4">
          <div>
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Meeting Agenda {slate.meetingNumber}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {slate.clubName}
            </h1>
            <p className="text-slate-500 font-medium text-sm">{slate.clubSubtitle}</p>
          </div>
          <div className="text-right text-xs sm:text-sm space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">📅 {slate.date}</p>
            <p className="text-slate-700 font-semibold">⏰ {slate.startTime} – {slate.endTime}</p>
            <p className="text-slate-500 text-xs max-w-xs">{slate.venue}</p>
          </div>
        </div>

        {/* Theme Highlight */}
        {slate.theme && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Today's Theme</span>
              <h2 className="text-xl sm:text-2xl font-extrabold italic mt-1">"{slate.theme}"</h2>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-300">Toastmaster of the Day</span>
              <p className="font-bold text-amber-400 text-lg">{slate.rolePlayers.tmod}</p>
            </div>
          </div>
        )}

        {/* Key Roles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">TMOD</span>
            <p className="font-bold text-slate-900 truncate text-sm mt-0.5">{slate.rolePlayers.tmod}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Gen. Evaluator</span>
            <p className="font-bold text-slate-900 truncate text-sm mt-0.5">{slate.rolePlayers.generalEvaluator}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Topics Master</span>
            <p className="font-bold text-slate-900 truncate text-sm mt-0.5">{slate.rolePlayers.tableTopicsMaster}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Grammarian</span>
            <p className="font-bold text-slate-900 truncate text-sm mt-0.5">{slate.rolePlayers.grammarian}</p>
          </div>
        </div>

        {/* Timeline Table */}
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span>⏱ Program Schedule</span>
          </h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-1/4">Time</th>
                  <th className="py-3 px-4 w-1/2">Activity & Project</th>
                  <th className="py-3 px-4 w-1/4">Accountability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timeline.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{seg.timeStart}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{seg.program}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs inline-block">
                        {seg.accountability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Toastmasters International Mission</p>
          <p className="mt-1 italic">{slate.clubMission}</p>
        </div>
      </div>
    );
  }

  // RENDER VIBRANT BANNER TEMPLATE
  return (
    <div className="print-page bg-white text-slate-900 shadow-2xl rounded-2xl mx-auto overflow-hidden border-2 border-[#772432] font-sans max-w-[850px]">
      <div className="bg-[#772432] text-white p-8 text-center space-y-2 border-b-8 border-[#f59e0b]">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider uppercase font-serif">
          {slate.clubName}
        </h1>
        <p className="text-amber-300 font-bold tracking-widest uppercase text-xs">
          Meeting {slate.meetingNumber} • {slate.date}
        </p>
        {slate.theme && (
          <div className="bg-white/10 backdrop-blur-xs py-2 px-6 rounded-full inline-block mt-3 border border-white/20">
            <span className="font-extrabold text-sm sm:text-base italic">✨ Theme: "{slate.theme}"</span>
          </div>
        )}
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex flex-wrap justify-between items-center text-xs sm:text-sm font-semibold text-amber-950">
          <div>🕰 <span className="font-bold">{slate.startTime} – {slate.endTime}</span></div>
          <div>🏢 <span className="font-bold">{slate.venue}</span></div>
        </div>

        <div>
          <h3 className="font-extrabold text-base text-[#772432] mb-2 uppercase tracking-wider border-b-2 border-[#772432] pb-1">
            Agenda Schedule
          </h3>
          <table className="w-full border-collapse border border-[#772432]/30 text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#772432] text-white font-bold">
                <th className="p-2.5 text-center w-1/4">Time</th>
                <th className="p-2.5 text-left px-4 w-1/2">Segment</th>
                <th className="p-2.5 text-left px-4 w-1/4">Speaker / Leader</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#772432]/20">
              {timeline.map((seg) => (
                <tr key={seg.id} className="hover:bg-rose-50/30">
                  <td className="p-2.5 text-center font-mono font-bold text-[#772432]">{seg.timeStart}</td>
                  <td className="p-2.5 px-4 font-semibold text-slate-800">{seg.program}</td>
                  <td className="p-2.5 px-4 font-bold text-slate-900">{seg.accountability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl text-center space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Club Mission</p>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-200 italic">{slate.clubMission}</p>
        </div>
      </div>
    </div>
  );
};
