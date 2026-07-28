/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TemplateStyle, MeetingSlate } from '../types';

interface NavbarProps {
  slate: MeetingSlate;
  templateStyle?: TemplateStyle;
  onSelectTemplate?: (style: TemplateStyle) => void;
  onOpenImportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  slate,
}) => {
  return (
    <header className="bg-[#004165] text-white shadow-md sticky top-0 z-40 no-print border-b border-[#008080]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-white text-[#004165] font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
            TI
          </div>
          <span className="font-bold text-sm tracking-wide text-white">
            CRG Toastmasters • Meeting {slate.meetingNumber || '#63'}
          </span>
          <span className="text-xs text-sky-200 hidden sm:inline">
            ({slate.date})
          </span>
        </div>
      </div>
    </header>
  );
};
