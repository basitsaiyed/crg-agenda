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
} from 'lucide-react';
import { MeetingSlate, SpeakerSlot } from '../types';

interface MeetingEditorProps {
  slate: MeetingSlate;
  onChange: (updatedSlate: MeetingSlate) => void;
  showTabs?: boolean;
  onToggleTabs?: () => void;
}

type TabType = 'general' | 'roleplayers' | 'speakers' | 'officers';

const inputCls =
  'w-full text-sm p-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#3A6BA8]';
const inputStyle = {
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
};
const labelCls = 'block text-xs font-bold uppercase tracking-wider mb-1';
const labelStyle = { color: 'var(--text2)' };

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
    if (onToggleTabs) onToggleTabs();
    else setLocalShowTabs(!localShowTabs);
  };

  const updateField = (field: keyof MeetingSlate, value: any) =>
    onChange({ ...slate, [field]: value });

  const updateRolePlayer = (role: keyof MeetingSlate['rolePlayers'], value: string) =>
    onChange({ ...slate, rolePlayers: { ...slate.rolePlayers, [role]: value } });

  const addSpeaker = () => {
    const newSpeaker: SpeakerSlot = {
      id: `spk-${slate.speakers.length + 1}-${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      project: '',
      evaluatorName: '',
      durationMax: 7,
    };
    onChange({ ...slate, speakers: [...slate.speakers, newSpeaker] });
  };

  const updateSpeaker = (index: number, field: keyof SpeakerSlot, value: any) => {
    const updated = [...slate.speakers];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...slate, speakers: updated });
  };

  const removeSpeaker = (index: number) =>
    onChange({ ...slate, speakers: slate.speakers.filter((_, i) => i !== index) });

  const updateOfficer = (index: number, name: string) => {
    const updated = [...slate.officers];
    updated[index] = { ...updated[index], name };
    onChange({ ...slate, officers: updated });
  };

  if (!isTabsVisible) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; accentColor: string }[] = [
    { id: 'speakers',    label: `Speakers (${slate.speakers.length})`, icon: <Mic className="w-3.5 h-3.5 flex-shrink-0" />,   accentColor: 'var(--blue)' },
    { id: 'roleplayers', label: 'Role Players',                         icon: <Users className="w-3.5 h-3.5 flex-shrink-0" />, accentColor: 'var(--navy)' },
    { id: 'general',     label: 'Meeting & Time',                       icon: <Sliders className="w-3.5 h-3.5 flex-shrink-0" />, accentColor: 'var(--gold)' },
    { id: 'officers',    label: 'Officers',                             icon: <Shield className="w-3.5 h-3.5 flex-shrink-0" />, accentColor: '#6b4fad' },
  ];

  return (
    <div
      className="overflow-hidden flex flex-col no-print mb-6"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 2px 12px 0 rgba(30,58,95,0.07)',
      }}
    >
      {/* Tab Header */}
      <div
        className="px-2 sm:px-3 pt-2 flex flex-wrap items-center justify-between gap-1 overflow-x-auto"
        style={{ background: 'var(--navy)', borderBottom: '1px solid #2d5080' }}
      >
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-t-lg text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap"
              style={
                activeTab === tab.id
                  ? {
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      borderTop: `3px solid ${tab.accentColor}`,
                    }
                  : { color: '#a8c4e0' }
              }
            >
              <span style={{ color: activeTab === tab.id ? tab.accentColor : '#a8c4e0' }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleToggle}
          className="text-xs font-bold px-2.5 py-1 rounded-lg mb-1 cursor-pointer transition whitespace-nowrap ml-auto"
          style={{ color: '#a8c4e0' }}
          title="Close editor"
        >
          ✕ Close
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">

        {/* ── SPEAKERS ── */}
        {activeTab === 'speakers' && (
          <div className="space-y-4">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                Prepared Speakers ({slate.speakers.length})
              </span>
              <button
                onClick={addSpeaker}
                className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                style={{ background: 'var(--navy)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Speaker
              </button>
            </div>

            {slate.speakers.length === 0 ? (
              <div
                className="text-center py-10 rounded-xl"
                style={{ border: '2px dashed var(--border2)' }}
              >
                <Mic className="w-9 h-9 mx-auto mb-2" style={{ color: 'var(--text3)' }} />
                <p className="font-bold text-sm" style={{ color: 'var(--text2)' }}>No speakers yet</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
                  Add a speaker slot to include them in the timeline
                </p>
                <button
                  onClick={addSpeaker}
                  className="text-white font-semibold px-4 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--navy)' }}
                >
                  + Add First Speaker
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {slate.speakers.map((spk, idx) => (
                  <div
                    key={spk.id}
                    className="p-4 rounded-xl space-y-3"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg2)' }}
                  >
                    <div
                      className="flex items-center justify-between pb-2.5"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-white font-extrabold text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--navy)' }}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                          Speaker & Evaluator Pair
                        </span>
                      </div>
                      <button
                        onClick={() => removeSpeaker(idx)}
                        className="p-1 rounded-lg transition cursor-pointer"
                        style={{ color: 'var(--text3)' }}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls} style={labelStyle}>Speaker Name</label>
                        <input
                          type="text"
                          value={spk.name}
                          onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                          placeholder="e.g. Harsh Raweel"
                          className={inputCls}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelCls} style={labelStyle}>Assigned Evaluator</label>
                        <input
                          type="text"
                          value={spk.evaluatorName}
                          onChange={(e) => updateSpeaker(idx, 'evaluatorName', e.target.value)}
                          placeholder="e.g. Megha Bhatt"
                          className={inputCls}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls} style={labelStyle}>Level & Project</label>
                        <input
                          type="text"
                          value={spk.project}
                          onChange={(e) => updateSpeaker(idx, 'project', e.target.value)}
                          placeholder="e.g. L3 P2 - Persuasive Influencer"
                          className={inputCls}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelCls} style={labelStyle}>Max Duration (mins)</label>
                        <input
                          type="number"
                          value={spk.durationMax}
                          onChange={(e) => updateSpeaker(idx, 'durationMax', parseInt(e.target.value, 10) || 7)}
                          min={2}
                          max={30}
                          className={`${inputCls} text-center font-bold`}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ROLE PLAYERS ── */}
        {activeTab === 'roleplayers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'tmod',              label: 'TMOD',                    icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} /> },
              { key: 'generalEvaluator',  label: 'General Evaluator (GE)',   icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /> },
              { key: 'tableTopicsMaster', label: 'Table Topics Master (TTM)',icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} /> },
              { key: 'grammarian',        label: 'Grammarian',               icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} /> },
              { key: 'timer',             label: 'Timer',                    icon: <User className="w-3.5 h-3.5" style={{ color: '#6b4fad' }} /> },
              { key: 'ahCounter',         label: 'Ah Counter',               icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} /> },
              { key: 'sergeantAtArms',    label: 'Sergeant-at-Arms (SAA)',   icon: <User className="w-3.5 h-3.5" style={{ color: '#b91c1c' }} /> },
              { key: 'presidingOfficer',  label: 'Presiding Officer (PO)',   icon: <User className="w-3.5 h-3.5" style={{ color: 'var(--text2)' }} /> },
            ].map(({ key, label, icon }) => (
              <div key={key}>
                <label className={`${labelCls} flex items-center gap-1.5`} style={labelStyle}>
                  {icon} {label}
                </label>
                <input
                  type="text"
                  value={(slate.rolePlayers as any)[key]}
                  onChange={(e) => updateRolePlayer(key as keyof MeetingSlate['rolePlayers'], e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── MEETING & TIME ── */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={`${labelCls} flex items-center gap-1`} style={labelStyle}>
                  <Award className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} /> Meeting #
                </label>
                <input
                  type="text"
                  value={slate.meetingNumber}
                  onChange={(e) => updateField('meetingNumber', e.target.value)}
                  placeholder="#1"
                  className={`${inputCls} font-bold`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={`${labelCls} flex items-center gap-1`} style={labelStyle}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} /> Date
                </label>
                <input
                  type="text"
                  value={slate.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="26/07/2026"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls} style={labelStyle}>Start</label>
                  <input
                    type="text"
                    value={slate.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    placeholder="10:45 AM"
                    className={`${inputCls} text-center font-bold text-xs`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>End</label>
                  <input
                    type="text"
                    value={slate.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    placeholder="12:30 PM"
                    className={`${inputCls} text-center font-bold text-xs`}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`${labelCls} flex items-center gap-1`} style={labelStyle}>
                <MapPin className="w-3.5 h-3.5" style={{ color: '#b91c1c' }} /> Venue
              </label>
              <input
                type="text"
                value={slate.venue}
                onChange={(e) => updateField('venue', e.target.value)}
                placeholder="e.g. GIFT CITY, Fire Station, Training Room..."
                className={inputCls}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={`${labelCls} flex items-center gap-1`} style={labelStyle}>
                <Award className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /> Theme
              </label>
              <input
                type="text"
                value={slate.theme}
                onChange={(e) => updateField('theme', e.target.value)}
                placeholder="e.g. Brewing Bonds: Chai, Rain & Friendship"
                className={inputCls}
                style={{ ...inputStyle, background: 'var(--gold-bg)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`${labelCls} flex items-center gap-1`} style={labelStyle}>
                  <Award className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} /> Club Number
                </label>
                <input
                  type="text"
                  value={slate.clubNumber || ''}
                  onChange={(e) => updateField('clubNumber', e.target.value)}
                  placeholder="28678751"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              className="pt-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <h4 className={`${labelCls} flex items-center gap-1.5 mb-3`} style={labelStyle}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--blue)' }} />
                Segment Durations (minutes)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { field: 'tableTopicsDuration', label: 'Table Topics', default: 20 },
                  { field: 'tagReportsDuration',  label: 'TAG Reports',  default: 5  },
                  { field: 'geReportDuration',     label: 'GE Report',    default: 5  },
                ].map(({ field, label, default: def }) => (
                  <div key={field}>
                    <label className={labelCls} style={labelStyle}>{label}</label>
                    <input
                      type="number"
                      value={(slate as any)[field] || def}
                      onChange={(e) => updateField(field as keyof MeetingSlate, parseInt(e.target.value, 10) || def)}
                      min={2} max={45}
                      className={`${inputCls} text-center font-bold`}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {/* Optional sections */}
              <div className="mt-4">
                <h4 className={`${labelCls} flex items-center gap-1.5 mb-2`} style={labelStyle}>
                  Optional Sections
                </h4>
                <label
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg select-none"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
                >
                  <input
                    type="checkbox"
                    checked={slate.includeNetworking !== false}
                    onChange={(e) => updateField('includeNetworking', e.target.checked)}
                    className="w-4 h-4 accent-[#1a5fa8] cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                      Networking Session <span className="font-normal text-xs" style={{ color: 'var(--text3)' }}>(15 min)</span>
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      Pre-meeting networking shown at the top of the agenda
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── OFFICERS ── */}
        {activeTab === 'officers' && (
          <div className="space-y-2.5">
            {slate.officers.map((off, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
              >
                <div className="w-1/3 text-xs font-bold truncate" style={{ color: 'var(--text2)' }}>
                  {off.position}
                </div>
                <input
                  type="text"
                  value={off.name}
                  onChange={(e) => updateOfficer(idx, e.target.value)}
                  placeholder="Name"
                  className="flex-1 text-xs sm:text-sm p-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#3A6BA8]"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
