/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MeetingSlate } from '../types';
import tmLogo from '../../assets/TMLogo.png';

interface NavbarProps {
  slate: MeetingSlate;
}

export const Navbar: React.FC<NavbarProps> = ({ slate }) => {
  return (
    <header
      className="sticky top-0 z-40 no-print"
      style={{ backgroundColor: 'var(--navy)', borderBottom: '1px solid #2d5080' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
        <div className="flex items-center space-x-2.5">
          <img
            src={tmLogo}
            alt="Toastmasters International"
            className="w-10 h-16 rounded-full object-contain flex-shrink-0"
          />
          <span className="font-bold text-sm tracking-wide text-white">
            CRG Toastmasters
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: '#a8c4e0' }}>
            • Meeting {slate.meetingNumber || '#1'}
            {slate.date ? ` · ${slate.date}` : ''}
          </span>
        </div>
      </div>
    </header>
  );
};
