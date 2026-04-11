"use client";

import { useState } from "react";
import { FamilyMember, MedLog, ActivityLog, ROLE_INFO } from "@/lib/types";

const isChildRole = (role: string) => role === "baby" || role === "toddler";
import UserAvatar from "./UserAvatar";

interface TrackerPanelProps {
  members: FamilyMember[];
  currentUser: FamilyMember | null;
  onUpdateMember: (member: FamilyMember) => void;
  onClose: () => void;
}

function canAccessTracker(child: FamilyMember, user: FamilyMember | null, members: FamilyMember[]): boolean {
  if (!user) return false;
  if (user.isAdmin) return true; // admins always have access
  if (!child.trackerAccessIds || child.trackerAccessIds.length === 0) return user.isAdmin; // default: admins only
  return child.trackerAccessIds.includes(user.id);
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function nextDoseIn(lastGiven: string, frequencyHours: number): string {
  const next = new Date(lastGiven).getTime() + frequencyHours * 3600000;
  const diff = next - Date.now();
  if (diff <= 0) return "⚠️ Due now!";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `in ${h}h ${m}m`;
}

export default function TrackerPanel({ members, currentUser, onUpdateMember, onClose }: TrackerPanelProps) {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("4");
  const [tab, setTab] = useState<"health" | "activity">("health");

  const selected = members.find(m => m.id === selectedMemberId);
  const hasAccess = selected ? canAccessTracker(selected, currentUser, members) : false;
  const isAdmin = currentUser?.isAdmin ?? false;

  const toggleSickMode = () => {
    if (!selected) return;
    onUpdateMember({ ...selected, sickMode: !selected.sickMode });
  };

  const logMedication = () => {
    if (!selected || !currentUser || !medName.trim()) return;
    const log: MedLog = {
      id: crypto.randomUUID(),
      medication: medName.trim(),
      dose: medDose.trim(),
      givenAt: new Date().toISOString(),
      givenById: currentUser.id,
      frequencyHours: parseInt(medFreq) || undefined,
    };
    const updated = { ...selected, medLogs: [log, ...(selected.medLogs || [])].slice(0, 20) };
    onUpdateMember(updated);
    setMedName(""); setMedDose(""); setShowMedForm(false);
  };

  const logActivity = (type: ActivityLog["type"], value?: string) => {
    if (!selected || !currentUser) return;
    const log: ActivityLog = {
      id: crypto.randomUUID(),
      type,
      value,
      loggedAt: new Date().toISOString(),
      loggedById: currentUser.id,
    };
    const updated = { ...selected, activityLogs: [log, ...(selected.activityLogs || [])].slice(0, 50) };
    onUpdateMember(updated);
  };

  const lastActivity = (type: ActivityLog["type"]) =>
    selected?.activityLogs?.find(a => a.type === type);

  const lastMed = selected?.medLogs?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 dark:border-stone-700 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">👶 Tracker</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
        </div>

        {/* Member picker */}
        <div className="flex gap-2 px-4 py-3 border-b border-stone-100 dark:border-stone-700 overflow-x-auto">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${selectedMemberId === m.id ? "bg-amber-50 dark:bg-amber-900/20" : "hover:bg-stone-50 dark:hover:bg-stone-700"}`}
            >
              <div className="relative">
                <UserAvatar name={m.name} color={m.color} photo={m.photo} size="sm" />
                {m.sickMode && (
                  <span className="absolute -top-1 -right-1 text-xs">🤒</span>
                )}
              </div>
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300 whitespace-nowrap">{m.name}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {/* Sick mode + overview */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-700/50">
              <div className="flex items-center gap-3">
                <UserAvatar name={selected.name} color={selected.color} photo={selected.photo} size="md" />
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-100">{selected.name}</p>
                  <p className="text-xs text-stone-400">{selected.role}</p>
                </div>
              </div>
              <button
                onClick={toggleSickMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selected.sickMode
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-stone-100 dark:bg-stone-600 text-stone-500 dark:text-stone-400"
                }`}
              >
                {selected.sickMode ? "🤒 Sick" : "😊 Well"}
              </button>
            </div>

            {/* Tabs — activity only for baby/toddler */}
            <div className="flex gap-2">
              {(["health", ...(isChildRole(selected.role) ? ["activity"] : [])] as string[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? "bg-amber-500 text-white" : "bg-stone-100 dark:bg-stone-700 text-stone-500"
                  }`}
                >
                  {t === "health" ? "💊 Health" : "📋 Activity"}
                </button>
              ))}
            </div>

            {/* No access state */}
            {!hasAccess && isChildRole(selected.role) && (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-stone-500 font-medium">No access</p>
                <p className="text-xs text-stone-400 mt-1">You don&apos;t have permission to log for {selected.name}. Ask an admin to grant you access.</p>
              </div>
            )}

            {/* Access settings (admin only, for child roles) */}
            {isAdmin && isChildRole(selected.role) && (
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-2">Who can log for {selected.name}?</p>
                <div className="flex flex-wrap gap-2">
                  {members.filter(m => m.id !== selected.id).map(m => {
                    const hasIt = !selected.trackerAccessIds?.length || selected.trackerAccessIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          const current = selected.trackerAccessIds || [];
                          const updated = current.includes(m.id)
                            ? current.filter(id => id !== m.id)
                            : [...current, m.id];
                          onUpdateMember({ ...selected, trackerAccessIds: updated });
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          hasIt
                            ? "bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300"
                            : "bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-400"
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        {m.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-400 mt-2">Admins always have access. Deselect to restrict.</p>
              </div>
            )}

            {/* Health tab */}
            {hasAccess && tab === "health" && (
              <div className="space-y-3">
                {/* Last medication */}
                {lastMed && (
                  <div className={`p-4 rounded-xl border-2 ${lastMed.frequencyHours && nextDoseIn(lastMed.givenAt, lastMed.frequencyHours).includes("⚠️") ? "border-red-300 bg-red-50 dark:bg-red-900/20" : "border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700/50"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-100">💊 {lastMed.medication}</p>
                        {lastMed.dose && <p className="text-sm text-stone-500">Dose: {lastMed.dose}</p>}
                        <p className="text-xs text-stone-400 mt-1">Given {formatTimeAgo(lastMed.givenAt)}</p>
                      </div>
                      {lastMed.frequencyHours && (
                        <div className="text-right">
                          <p className="text-xs text-stone-400">Next dose</p>
                          <p className={`text-sm font-bold ${nextDoseIn(lastMed.givenAt, lastMed.frequencyHours).includes("⚠️") ? "text-red-500" : "text-emerald-600"}`}>
                            {nextDoseIn(lastMed.givenAt, lastMed.frequencyHours)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Log medication */}
                {!showMedForm ? (
                  <button
                    onClick={() => setShowMedForm(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 text-sm font-medium hover:border-amber-400 hover:text-amber-500 transition-colors"
                  >
                    + Log Medication
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-3">
                    <input
                      value={medName}
                      onChange={e => setMedName(e.target.value)}
                      placeholder="Medication name (e.g. Tylenol)"
                      className="w-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <input
                      value={medDose}
                      onChange={e => setMedDose(e.target.value)}
                      placeholder="Dose (e.g. 5ml, 1 tablet)"
                      className="w-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-500">Repeat every</span>
                      <select
                        value={medFreq}
                        onChange={e => setMedFreq(e.target.value)}
                        className="bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-2 py-1 text-sm focus:outline-none"
                      >
                        <option value="">One time</option>
                        <option value="2">2 hours</option>
                        <option value="4">4 hours</option>
                        <option value="6">6 hours</option>
                        <option value="8">8 hours</option>
                        <option value="12">12 hours</option>
                        <option value="24">24 hours</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={logMedication} className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold">Log Now</button>
                      <button onClick={() => setShowMedForm(false)} className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-500 text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Medication history */}
                {(selected.medLogs?.length ?? 0) > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">History</p>
                    {selected.medLogs!.slice(1, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-700/50">
                        <div>
                          <span className="text-sm font-medium">{log.medication}</span>
                          {log.dose && <span className="text-xs text-stone-400 ml-2">{log.dose}</span>}
                        </div>
                        <span className="text-xs text-stone-400">{formatTimeAgo(log.givenAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity tab */}
            {hasAccess && tab === "activity" && (
              <div className="space-y-3">
                {/* Quick log buttons — only for baby/toddler */}
                {isChildRole(selected.role) && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: "fed" as const, emoji: "🍼", label: "Fed" },
                      { type: "sleep" as const, emoji: "😴", label: "Sleep" },
                      { type: "diaper" as const, emoji: "👶", label: "Diaper" },
                      { type: "mood" as const, emoji: "😊", label: "Happy" },
                    ].map(({ type, emoji, label }) => {
                      const last = lastActivity(type);
                      return (
                        <button
                          key={type}
                          onClick={() => logActivity(type, type === "mood" ? "😊" : undefined)}
                          className="flex flex-col items-center gap-1 p-3 rounded-xl bg-stone-50 dark:bg-stone-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{label}</span>
                          {last && <span className="text-[10px] text-stone-400">{formatTimeAgo(last.loggedAt)}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mood selector */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Log Mood</p>
                  <div className="flex gap-2">
                    {["😊", "😐", "😢", "😡", "🤒", "😴", "🥳"].map(mood => (
                      <button key={mood} onClick={() => logActivity("mood", mood)} className="text-2xl p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity history */}
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Recent</p>
                  <div className="space-y-2">
                    {(selected.activityLogs || []).slice(0, 8).map(log => (
                      <div key={log.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {log.type === "fed" ? "🍼" : log.type === "sleep" ? "😴" : log.type === "diaper" ? "👶" : log.value || "📝"}
                          </span>
                          <span className="text-sm capitalize">{log.type}</span>
                        </div>
                        <span className="text-xs text-stone-400">{formatTimeAgo(log.loggedAt)}</span>
                      </div>
                    ))}
                    {!(selected.activityLogs?.length) && (
                      <p className="text-sm text-stone-400 text-center py-4">No activity logged yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
