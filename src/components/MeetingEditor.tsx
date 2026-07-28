/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Mic, 
  Plus, 
  Trash2, 
  Award, 
  Shield, 
  Sliders,
  HelpCircle
} from 'lucide-react';
import { MeetingSlate, SpeakerSlot, ClubOfficer } from '../types';

interface MeetingEditorProps {
  slate: MeetingSlate;
  onChange: (updatedSlate: MeetingSlate) => void;
  showTabs?: boolean;
  onToggleTabs?: () => void;
}

type TabType = 'general' | 'roleplayers' | 'speakers' | 'officers';

export const MeetingEditor: React.FC<MeetingEditorProps> = ({
  slate,
  onChange,
  showTabs: propShowTabs,
  onToggleTabs,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('speakers');
  const [localShowTabs, setLocalShowTabs] = useState(false);

  const isTabsVisible = propShowTabs !== undefined ? propShowTabs : localShowTabs;
  const handleToggle = () => {
    if (onToggleTabs) {
      onToggleTabs();
    } else {
      setLocalShowTabs(!localShowTabs);
    }
  };

  const updateField = (field: keyof MeetingSlate, value: any) => {
    onChange({
      ...slate,
      [field]: value,
    });
  };

  const updateRolePlayer = (role: keyof MeetingSlate['rolePlayers'], value: string) => {
    onChange({
      ...slate,
      rolePlayers: {
        ...slate.rolePlayers,
        [role]: value,
      },
    });
  };

  const addSpeaker = () => {
    const newId = `spk-${slate.speakers.length + 1}-${Math.random().toString(36).substring(2, 5)}`;
    const newSpeaker: SpeakerSlot = {
      id: newId,
      name: `Speaker ${slate.speakers.length + 1}`,
      project: `Level & Project ${slate.speakers.length + 1}`,
      evaluatorName: `Evaluator ${slate.speakers.length + 1}`,
      durationMax: 7,
    };
    onChange({
      ...slate,
      speakers: [...slate.speakers, newSpeaker],
    });
  };

  const updateSpeaker = (index: number, field: keyof SpeakerSlot, value: any) => {
    const updated = [...slate.speakers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...slate,
      speakers: updated,
    });
  };

  const removeSpeaker = (index: number) => {
    const updated = slate.speakers.filter((_, i) => i !== index);
    onChange({
      ...slate,
      speakers: updated,
    });
  };

  const updateOfficer = (index: number, name: string) => {
    const updated = [...slate.officers];
    updated[index] = {
      ...updated[index],
      name,
    };
    onChange({
      ...slate,
      officers: updated,
    });
  };

  if (!isTabsVisible) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col no-print mb-6">
      {/* Tab Header */}
      <div className="bg-slate-800 text-white px-2 sm:px-4 pt-2 sm:pt-3 flex flex-wrap items-center justify-between gap-1 border-b border-slate-700 overflow-x-auto">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('speakers')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'speakers'
              ? 'bg-white text-slate-900 shadow-md border-t-4 border-[#008080]'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#008080] flex-shrink-0" />
          <span>Speakers ({slate.speakers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roleplayers')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'roleplayers'
              ? 'bg-white text-slate-900 shadow-md border-t-4 border-[#004165]'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#004165] flex-shrink-0" />
          <span>Role Players</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white text-slate-900 shadow-md border-t-4 border-amber-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <Sliders className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500 flex-shrink-0" />
          <span>Meeting & Time</span>
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'officers'
              ? 'bg-white text-slate-900 shadow-md border-t-4 border-rose-600'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-rose-600 flex-shrink-0" />
          <span>Officers</span>
        </button>
        </div>

        <button
          onClick={handleToggle}
          className="text-slate-400 hover:text-white px-2.5 py-1 text-xs font-bold transition mb-1 cursor-pointer hover:bg-slate-700/60 rounded-lg whitespace-nowrap ml-auto"
          title="Close Sections Editor"
        >
          ✕ Close Editor
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
        {/* TAB 1: SPEAKERS & EVALUATORS (DYNAMIC SCALING) */}
        {activeTab === 'speakers' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-sm text-slate-800">Prepared Speakers ({slate.speakers.length})</span>
              <button
                onClick={addSpeaker}
                className="flex items-center gap-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Speaker Slot</span>
              </button>
            </div>

            {slate.speakers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50">
                <Mic className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No Prepared Speakers listed</p>
                <p className="text-xs text-slate-500 mb-4">Click "Add Speaker Slot" to add speeches to the agenda timeline</p>
                <button
                  onClick={addSpeaker}
                  className="bg-[#008080] text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  + Add First Speaker
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {slate.speakers.map((spk, idx) => (
                  <div
                    key={spk.id}
                    className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:border-[#008080]/40 transition space-y-3 relative shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#008080] text-white font-extrabold text-xs px-2.5 py-1 rounded-full">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800">Speaker & Evaluator Pair</h4>
                      </div>
                      <button
                        onClick={() => removeSpeaker(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove Speaker Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Speaker Name:
                        </label>
                        <input
                          type="text"
                          value={spk.name}
                          onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                          placeholder="e.g. Harsh Raweel"
                          className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008080] bg-white font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Assigned Evaluator:
                        </label>
                        <input
                          type="text"
                          value={spk.evaluatorName}
                          onChange={(e) => updateSpeaker(idx, 'evaluatorName', e.target.value)}
                          placeholder="e.g. Megha Bhatt"
                          className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008080] bg-white font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Level & Project Objective:
                        </label>
                        <input
                          type="text"
                          value={spk.project}
                          onChange={(e) => updateSpeaker(idx, 'project', e.target.value)}
                          placeholder="e.g. Persuasive Influencer - L3 P2 - Social Speech"
                          className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008080] bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Speech Slot (Mins):
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={spk.durationMax}
                            onChange={(e) => updateSpeaker(idx, 'durationMax', parseInt(e.target.value, 10) || 7)}
                            min={2}
                            max={30}
                            className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008080] bg-white font-bold text-center text-slate-900"
                          />
                          <span className="text-xs text-slate-500 font-medium">mins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROLE PLAYERS */}
        {activeTab === 'roleplayers' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Toastmaster of the Day (TMOD):</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.tmod}
                  onChange={(e) => updateRolePlayer('tmod', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#008080] bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>General Evaluator (GE):</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.generalEvaluator}
                  onChange={(e) => updateRolePlayer('generalEvaluator', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span>Table Topics Master (TTM):</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.tableTopicsMaster}
                  onChange={(e) => updateRolePlayer('tableTopicsMaster', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Grammarian:</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.grammarian}
                  onChange={(e) => updateRolePlayer('grammarian', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Timer:</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.timer}
                  onChange={(e) => updateRolePlayer('timer', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ah Counter:</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.ahCounter}
                  onChange={(e) => updateRolePlayer('ahCounter', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sergeant-at-Arms (SAA):</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.sergeantAtArms}
                  onChange={(e) => updateRolePlayer('sergeantAtArms', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-800" />
                  <span>Presiding Officer (PO):</span>
                </label>
                <input
                  type="text"
                  value={slate.rolePlayers.presidingOfficer}
                  onChange={(e) => updateRolePlayer('presidingOfficer', e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-700 bg-slate-50 font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEETING & TIME SETTINGS */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Meeting #:</span>
                </label>
                <input
                  type="text"
                  value={slate.meetingNumber}
                  onChange={(e) => updateField('meetingNumber', e.target.value)}
                  placeholder="e.g. #63"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#004165]" />
                  <span>Meeting Date:</span>
                </label>
                <input
                  type="text"
                  value={slate.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="e.g. 26/07/2026"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time:
                  </label>
                  <input
                    type="text"
                    value={slate.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    placeholder="10:45 AM"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-center text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Time:
                  </label>
                  <input
                    type="text"
                    value={slate.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    placeholder="12:30 PM"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-center text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Venue & Location:</span>
              </label>
              <input
                type="text"
                value={slate.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                placeholder="e.g. GIFT CITY, Fire Station, Training Room..."
                className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Meeting Theme:</span>
              </label>
              <input
                type="text"
                value={slate.theme}
                onChange={(e) => updateField('theme', e.target.value)}
                placeholder="e.g. Brewing Bonds: Chai, Rain & Friendship"
                className="w-full text-sm p-2.5 border border-slate-300 rounded-xl font-semibold bg-amber-50/50 text-slate-900"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#008080]" />
                <span>Segment Duration Tuning (Minutes)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    Table Topics (TTM):
                  </label>
                  <input
                    type="number"
                    value={slate.tableTopicsDuration || 20}
                    onChange={(e) => updateField('tableTopicsDuration', parseInt(e.target.value, 10) || 20)}
                    min={5}
                    max={45}
                    className="w-full text-sm p-2 border border-slate-300 rounded-xl text-center font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    TAG Reports:
                  </label>
                  <input
                    type="number"
                    value={slate.tagReportsDuration || 5}
                    onChange={(e) => updateField('tagReportsDuration', parseInt(e.target.value, 10) || 5)}
                    min={2}
                    max={15}
                    className="w-full text-sm p-2 border border-slate-300 rounded-xl text-center font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">
                    GE Report:
                  </label>
                  <input
                    type="number"
                    value={slate.geReportDuration || 5}
                    onChange={(e) => updateField('geReportDuration', parseInt(e.target.value, 10) || 5)}
                    min={2}
                    max={15}
                    className="w-full text-sm p-2 border border-slate-300 rounded-xl text-center font-bold bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLUB OFFICERS */}
        {activeTab === 'officers' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-2.5">
              {slate.officers.map((off, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-1/3 text-xs font-bold text-slate-700 truncate">
                    {off.position}
                  </div>
                  <input
                    type="text"
                    value={off.name}
                    onChange={(e) => updateOfficer(idx, e.target.value)}
                    className="flex-1 text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                    placeholder="Officer Name"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
