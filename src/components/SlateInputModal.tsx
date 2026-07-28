/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Zap, FileText, CheckCircle2, AlertCircle, ClipboardPaste } from 'lucide-react';
import { MeetingSlate } from '../types';
import { parseSlateTextLocally } from '../lib/agenda-utils';

interface SlateInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySlate: (newSlate: Partial<MeetingSlate>) => void;
}

export const SlateInputModal: React.FC<SlateInputModalProps> = ({
  isOpen,
  onClose,
  onApplySlate,
}) => {
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setRawText(text);
        setErrorMsg(null);
        setSuccessMsg('Text pasted from clipboard!');
        setTimeout(() => setSuccessMsg(null), 2000);
      } else {
        setErrorMsg('Clipboard is empty. Copy your slate text first.');
      }
    } catch {
      setErrorMsg('Clipboard access denied. Please paste manually using Ctrl+V / ⌘V.');
    }
  };

  const handleParse = () => {
    if (!rawText.trim()) {
      setErrorMsg('Please paste slate text first.');
      return;
    }
    const result = parseSlateTextLocally(rawText);
    onApplySlate(result);
    setSuccessMsg('⚡ Slate parsed and agenda updated!');
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 no-print"
      style={{ background: 'rgba(30,58,95,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          boxShadow: '0 8px 40px 0 rgba(30,58,95,0.18)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-3.5 flex items-center justify-between"
          style={{ background: 'var(--navy)', borderBottom: '1px solid #2d5080' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white leading-tight">Import Nomination Slate</h2>
              <p className="text-xs" style={{ color: '#a8c4e0' }}>
                Paste your WhatsApp / email announcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition cursor-pointer"
            style={{ color: '#a8c4e0' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--text2)' }}
              >
                Nomination Sheet Text
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text2)',
                }}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the role players nomination sheet here…"
              rows={10}
              className="w-full font-mono text-xs sm:text-sm p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A6BA8] resize-y leading-relaxed"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                color: 'var(--text)',
              }}
            />
          </div>

          {errorMsg && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium"
              style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium"
              style={{ background: 'var(--green-bg)', border: '1px solid #bbf7d0', color: 'var(--green)' }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3"
          style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer order-2 sm:order-1"
            style={{ color: 'var(--text2)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer order-1 sm:order-2"
            style={{ background: 'var(--navy)' }}
          >
            <Zap className="w-4 h-4" style={{ color: '#e8be6a' }} />
            Extract & Populate Slate
          </button>
        </div>
      </div>
    </div>
  );
};
