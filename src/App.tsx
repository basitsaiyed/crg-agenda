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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  const [slate, setSlate] = useState<MeetingSlate>(DEFAULT_CRG_SLATE);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');
  const [showEditorTabs, setShowEditorTabs] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  const buildFileName = () => {
    const num = slate.meetingNumber.replace(/[^0-9]/g, '');
    const rawDate = slate.date;
    const ddmmyyyy = rawDate.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    let formattedDate = rawDate.replace(/\//g, '');
    if (ddmmyyyy) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const day = parseInt(ddmmyyyy[1], 10);
      const mon = months[parseInt(ddmmyyyy[2], 10) - 1];
      const yr = ddmmyyyy[3];
      formattedDate = `${day}th${mon}${yr}`;
    }
    return `Agenda_${num}_${formattedDate}`;
  };

  const handlePrint = async () => {
    setIsExporting(true);
    try {
      const A4_W = 794;
      const A4_H = 1123;

      // ── Render a hidden off-screen clone at full 794px — no CSS transforms ──
      // This is the only reliable way to get clean output on mobile, where the
      // screen preview is scaled down via transform:scale().
      const offscreen = document.createElement('div');
      offscreen.style.cssText = [
        'position:fixed',
        'top:0',
        'left:-9999px',
        `width:${A4_W}px`,
        'pointer-events:none',
        'z-index:-1',
        'background:#fff',
      ].join(';');
      document.body.appendChild(offscreen);

      const sourceCards = document.querySelectorAll<HTMLElement>('.agenda-print-page');
      const clones: HTMLElement[] = [];
      sourceCards.forEach((card) => {
        const clone = card.cloneNode(true) as HTMLElement;
        clone.style.cssText = [
          `width:${A4_W}px`,
          `min-height:${A4_H}px`,
          `max-height:${A4_H}px`,
          'overflow:hidden',
          'box-shadow:none',
          'border:none',
          'border-radius:0',
          'margin:0',
          'padding:12px 12px 24px 12px',
          'box-sizing:border-box',
          'display:flex',
          'flex-direction:column',
          'background:#fff',
          'transform:none',
        ].join(';');
        offscreen.appendChild(clone);
        clones.push(clone);
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < clones.length; i++) {
        const canvas = await html2canvas(clones[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: A4_W,
          height: A4_H,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.97);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      document.body.removeChild(offscreen);
      pdf.save(`${buildFileName()}.pdf`);
    } finally {
      setIsExporting(false);
    }
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
    <div className="min-h-screen flex flex-col font-sans app-root" style={{ background: 'var(--bg2)', color: 'var(--text)' }}>
      {/* Top Navbar */}
      <Navbar slate={slate} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 flex flex-col">
        {/* Mobile View Toggle Bar */}
        {showEditorTabs && (
          <div
            className="flex lg:hidden p-1 rounded-xl mb-4 no-print"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setMobileTab('editor')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer"
              style={
                mobileTab === 'editor'
                  ? { background: 'var(--navy)', color: '#fff' }
                  : { color: 'var(--text2)' }
              }
            >
              <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
              Edit Sections
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer"
              style={
                mobileTab === 'preview'
                  ? { background: 'var(--navy)', color: '#fff' }
                  : { color: 'var(--text2)' }
              }
            >
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              Live Preview
            </button>
          </div>
        )}

        {/* Split Grid Layout */}
        <div className={`grid grid-cols-1 ${showEditorTabs ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start flex-1`}>
          {/* Editor */}
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

          {/* Preview */}
          <div
            className={`${showEditorTabs ? 'lg:col-span-7' : 'lg:col-span-1 max-w-4xl mx-auto w-full'} ${
              showEditorTabs && mobileTab === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between mb-3 no-print px-1 flex-wrap gap-1">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--green)' }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text3)' }}
                >
                  Live Preview · Printable Format
                </span>
              </div>
              <span className="text-xs hidden sm:inline" style={{ color: 'var(--text3)' }}>
                A4 Portrait
              </span>
            </div>

            <div className="w-full pb-4">
              <AgendaPreview slate={slate} />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-wrap items-center gap-2 p-2 rounded-2xl no-print"
        style={{
          background: 'var(--navy)',
          border: '1px solid #2d5080',
          boxShadow: '0 4px 24px 0 rgba(30,58,95,0.25)',
        }}
      >
        {/* Toggle Editor */}
        <button
          onClick={() => {
            const nextState = !showEditorTabs;
            setShowEditorTabs(nextState);
            if (nextState) setMobileTab('editor');
            else setMobileTab('preview');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          style={
            showEditorTabs
              ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.08)', color: '#a8c4e0' }
          }
        >
          <Sliders className="w-4 h-4" style={{ color: '#e8be6a' }} />
          {showEditorTabs ? 'Close Editor ✕' : 'Edit Sections ✏️'}
        </button>

        {/* Paste Slate */}
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-1.5 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          style={{ background: 'var(--gold)', color: '#fff' }}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Paste Slate</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleCopyWhatsAppSummary}
          className="flex items-center gap-1.5 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid #2d5080',
            color: copied ? '#4ade80' : '#a8c4e0',
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'WhatsApp'}</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={handlePrint}
          disabled={isExporting}
          className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          style={{ background: isExporting ? '#4a8a6a' : 'var(--green)', opacity: isExporting ? 0.8 : 1 }}
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'Export PDF'}</span>
        </button>
      </div>

      <SlateInputModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onApplySlate={handleApplySlate}
      />
    </div>
  );
}

