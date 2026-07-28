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
    <header className="bg-[#004165] text-white shadow-md sticky top-0 z-40 no-print border-b border-[#008080]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
        <div className="flex items-center space-x-2.5">
          <img
            src={tmLogo}
            alt="Toastmasters International"
            className="w-8 h-8 rounded-full object-contain bg-white border border-amber-400 flex-shrink-0"
          />
          <span className="font-bold text-sm tracking-wide text-white">
            CRG Toastmasters • Agenda
          </span>
        </div>
      </div>
    </header>
  );
};
