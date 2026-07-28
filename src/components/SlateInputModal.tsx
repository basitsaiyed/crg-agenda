/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Zap, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MeetingSlate } from '../types';
import { RAW_SAMPLE_SLATE_TEXT, parseSlateTextLocally } from '../lib/agenda-utils';

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
  const [rawText, setRawText] = useState(RAW_SAMPLE_SLATE_TEXT);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setRawText(RAW_SAMPLE_SLATE_TEXT);
    setErrorMsg(null);
    setSuccessMsg('Sample CRG Meeting #63 slate loaded into editor!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleParse = () => {
    if (!rawText.trim()) {
      setErrorMsg('Please paste slate text first.');
      return;
    }
    const result = parseSlateTextLocally(rawText);
    onApplySlate(result);
    setSuccessMsg('⚡ Slate parsed and agenda updated successfully!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#004165] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#008080]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#008080] p-1.5 rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">Import Role Players Slate</h2>
              <p className="text-xs text-sky-200">Paste your WhatsApp / Email nomination announcement below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl gap-2.5">
            <span className="text-xs sm:text-sm text-amber-900 font-medium">
              💡 Need to test quickly? Use the official CRG Sunday Slate (#63).
            </span>
            <button
              onClick={handleLoadSample}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap text-center"
            >
              🚀 Load Sample #63
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paste Nomination Sheet Text:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the role players nomination sheet here (e.g. TMOD: Shantanu, General Evaluator: Prasoon, Speaker 1: Harsh Raweel...)"
              rows={9}
              className="w-full font-mono text-xs sm:text-sm p-3 sm:p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent bg-slate-50 text-slate-800 resize-y leading-relaxed shadow-inner"
            />
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition cursor-pointer order-2 sm:order-1"
          >
            Cancel
          </button>
          
          <button
            onClick={handleParse}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-[#008080] to-[#004165] hover:from-[#006666] hover:to-[#002e47] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md hover:scale-105 active:scale-95 cursor-pointer order-1 sm:order-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Extract & Populate Slate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
