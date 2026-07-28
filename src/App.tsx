/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MeetingEditor } from './components/MeetingEditor';
import { AgendaPreview } from './components/AgendaPreview';
import { SlateInputModal } from './components/SlateInputModal';
import { DEFAULT_CRG_SLATE, calculateAgendaTimeline } from './lib/agenda-utils';
import { MeetingSlate } from './types';
import { FileText, Eye, Edit3, Sliders, Printer, Copy, Check } from 'lucide-react';

export default function App() {
  const [slate, setSlate] = useState<MeetingSlate>(DEFAULT_CRG_SLATE);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');
  const [showEditorTabs, setShowEditorTabs] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    // Format filename: Agenda_63_26thJuly2026.pdf
    const num = slate.meetingNumber.replace(/[^0-9]/g, '');
    const rawDate = slate.date; // e.g. "26/07/2026"
    const ddmmyyyy = rawDate.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    let formattedDate = rawDate.replace(/\//g, '');
    if (ddmmyyyy) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const day = parseInt(ddmmyyyy[1], 10);
      const mon = months[parseInt(ddmmyyyy[2], 10) - 1];
      const yr = ddmmyyyy[3];
      formattedDate = `${day}th${mon}${yr}`;
    }
    const prevTitle = document.title;
    document.title = `Agenda_${num}_${formattedDate}`;
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 2000);
  };

  const handleCopyWhatsAppSummary = () => {
    const timeline = calculateAgendaTimeline(slate);
    let summary = `📢 *CRG TOASTMASTERS - ${slate.meetingNumber} AGENDA* 📢\n`;
    summary += `📆 Date: ${slate.date} | 🕰 ${slate.startTime} – ${slate.endTime}\n`;
    summary += `🏢 Venue: ${slate.venue}\n`;
    summary += `💫 Theme: "${slate.theme}"\n\n`;
    
    summary += `*🌟 KEY ROLE PLAYERS:*\n`;
    summary += `• TMOD: ${slate.rolePlayers.tmod}\n`;
    summary += `• General Evaluator: ${slate.rolePlayers.generalEvaluator}\n`;
    summary += `• Table Topics Master: ${slate.rolePlayers.tableTopicsMaster}\n\n`;
    
    summary += `*🎤 PREPARED SPEAKERS:*\n`;
    if (slate.speakers.length === 0) {
      summary += `• No speakers scheduled yet\n`;
    } else {
      slate.speakers.forEach((spk, idx) => {
        summary += `• Speaker ${idx + 1}: *${spk.name}* (${spk.project}) - Eval: ${spk.evaluatorName || 'TBA'}\n`;
      });
    }
    summary += `\n*⏱ PROGRAM TIMELINE:*\n`;
    timeline.forEach(seg => {
      summary += `• ${seg.timeStart} -> ${seg.program} (${seg.accountability})\n`;
    });
    summary += `\n✨ "Run by Runners"`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleApplySlate = (newPartialSlate: Partial<MeetingSlate>) => {
    setSlate((prev) => ({
      ...prev,
      ...newPartialSlate,
      rolePlayers: {
        ...prev.rolePlayers,
        ...(newPartialSlate.rolePlayers || {}),
      },
      officers: newPartialSlate.officers || prev.officers,
      speakers: newPartialSlate.speakers !== undefined ? newPartialSlate.speakers : prev.speakers,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        slate={slate}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 flex flex-col">
        {/* Mobile View Toggle Bar - Only visible when editing is active */}
        {showEditorTabs && (
          <div className="flex lg:hidden bg-slate-200 p-1 rounded-xl mb-4 no-print shadow-inner">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mobileTab === 'editor'
                  ? 'bg-[#008080] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Edit Sections</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-[#004165] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Live Agenda Preview</span>
            </button>
          </div>
        )}

        {/* Split Grid Layout */}
        <div className={`grid grid-cols-1 ${showEditorTabs ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start flex-1`}>
          {/* Left Column: Editor (Hidden in print or mobile preview tab) */}
          <div
            className={`${showEditorTabs ? 'lg:col-span-5' : 'lg:col-span-1'} h-auto ${showEditorTabs ? 'lg:sticky lg:top-24' : ''} ${
              !showEditorTabs || mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            } no-print`}
          >
            <MeetingEditor
              slate={slate}
              onChange={setSlate}
              showTabs={showEditorTabs}
              onToggleTabs={() => {
                const nextState = !showEditorTabs;
                setShowEditorTabs(nextState);
                if (!nextState) setMobileTab('preview');
              }}
            />
          </div>

          {/* Right Column: Live Printable Sheet */}
          <div
            className={`${showEditorTabs ? 'lg:col-span-7' : 'lg:col-span-1 max-w-4xl mx-auto w-full'} ${
              showEditorTabs && mobileTab === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between mb-3 no-print px-1 flex-wrap gap-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Live Preview • Official Printable Format
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                A4 Portrait Mode Ready
              </span>
            </div>

            {/* The Print Sheet */}
            <div className="overflow-x-auto pb-4">
              <AgendaPreview slate={slate} />
            </div>
          </div>
        </div>
      </main>

      {/* Positioned Floating Control Bar (no-print) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-wrap items-center gap-2 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-700 text-white no-print">
        {/* Toggle Editor Tabs */}
        <button
          onClick={() => {
            const nextState = !showEditorTabs;
            setShowEditorTabs(nextState);
            if (nextState) {
              setMobileTab('editor');
            } else {
              setMobileTab('preview');
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer ${
            showEditorTabs ? 'bg-[#008080] text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title="Toggle Speakers, Role Players, Meeting & Time, Officers"
        >
          <Sliders className="w-4 h-4 text-[#008080]" />
          <span>{showEditorTabs ? 'Close Editor ✕' : 'Edit Sections ✏️'}</span>
        </button>

        {/* Paste Slate Text */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer"
          title="Paste WhatsApp Slate Text"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Paste Slate</span>
        </button>

        {/* Copy WhatsApp Summary */}
        <button
          onClick={handleCopyWhatsAppSummary}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
          title="Copy WhatsApp Summary"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'WhatsApp'}</span>
        </button>

        {/* Print / Export PDF */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer"
          title="Export PDF / Print"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Modals */}
      <SlateInputModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplySlate={handleApplySlate}
      />
    </div>
  );
}

