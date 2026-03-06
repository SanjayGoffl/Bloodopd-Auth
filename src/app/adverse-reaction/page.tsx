"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AlertOctagon, CheckCircle2 } from "lucide-react";

const REACTION_TYPES = [
  { id: "fever", label: "Fever (>38°C)" },
  { id: "rigors", label: "Rigors / Chills" },
  { id: "urticaria", label: "Urticaria / Rash" },
  { id: "hypotension", label: "Hypotension" },
  { id: "dyspnoea", label: "Dyspnoea / Shortness of Breath" },
  { id: "back_pain", label: "Back / Flank Pain" },
  { id: "haemoglobinuria", label: "Haemoglobinuria (dark urine)" },
  { id: "facial_flushing", label: "Facial Flushing" },
  { id: "chest_pain", label: "Chest Pain" },
  { id: "other", label: "Other" },
];

const IMMEDIATE_ACTIONS = [
  { id: "stopped", label: "Transfusion stopped" },
  { id: "iv_access", label: "IV access maintained" },
  { id: "doctor_informed", label: "Treating doctor informed" },
  { id: "vitals_recorded", label: "Vitals recorded" },
  { id: "samples_sent", label: "Blood/urine samples sent to lab" },
  { id: "oxygen", label: "Oxygen administered" },
];

export default function AdverseReactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <AdverseReactionInner />
    </Suspense>
  )
}

function AdverseReactionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const supabase = createClient();

  const [stopped, setStopped] = useState(false);
  const [reactionTypes, setReactionTypes] = useState<string[]>([]);
  const [onsetMinutes, setOnsetMinutes] = useState("");
  const [volumeMl, setVolumeMl] = useState("");
  const [immediateActions, setImmediateActions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleReaction(id: string) {
    setReactionTypes(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  }
  function toggleAction(id: string) {
    setImmediateActions(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  async function handleStop() {
    setStopped(true);
    // Immediately suspend unit in system
    if (requestId) {
      await supabase.from("transfusion_requests").update({ status: "reaction" }).eq("id", requestId);
    }
    // Alert officer
    await supabase.from("notifications").insert({
      recipient_id: "11111111-0000-0000-0000-000000000002", // Officer
      title: "TRANSFUSION REACTION REPORTED",
      body: `Nurse has stopped transfusion for request ${requestId}. Adverse reaction being reported.`,
      severity: "critical",
      related_resource_type: "transfusion_request",
      related_resource_id: requestId,
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!stopped) e.stop = "You must press STOP TRANSFUSION before submitting the report.";
    if (reactionTypes.length === 0) e.reactions = "Select at least one reaction type.";
    if (!onsetMinutes) e.onset = "Onset time is required.";
    if (!volumeMl) e.volume = "Volume transfused is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("adverse_reactions").insert({
      request_id: requestId,
      unit_id: "33333333-0000-0000-0000-000000000001", // demo unit
      nurse_id: user.id,
      reaction_types: reactionTypes,
      onset_minutes: parseInt(onsetMinutes),
      volume_transfused_ml: parseFloat(volumeMl),
      stop_transfusion_at: new Date().toISOString(),
      immediate_actions: immediateActions,
      notes: notes || null,
      investigation_status: "open",
    });

    // Notify HOD + Officer
    await supabase.from("notifications").insert([
      {
        recipient_id: "11111111-0000-0000-0000-000000000001",
        title: "ADVERSE REACTION REPORT FILED",
        body: `Nurse filed adverse reaction report. Reactions: ${reactionTypes.join(", ")}. Investigation case opened.`,
        severity: "critical",
        related_resource_type: "adverse_reaction",
      },
      {
        recipient_id: "11111111-0000-0000-0000-000000000002",
        title: "UNIT QUARANTINED — Adverse Reaction",
        body: `Unit quarantined due to adverse reaction report. HOD investigation pending.`,
        severity: "critical",
        related_resource_type: "adverse_reaction",
      },
    ]);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ADVERSE_REACTION_REPORTED",
      resource_type: "transfusion_request",
      resource_id: requestId,
      severity: "critical",
      new_value: { reaction_types: reactionTypes, onset_minutes: parseInt(onsetMinutes), volume_ml: parseFloat(volumeMl) },
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard/nurse"), 3000);
    } else {
      setErrors({ submit: error.message });
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Report Submitted</h2>
          <p className="text-gray-500 mt-2">HOD investigation case opened. Unit quarantined. Officer notified.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to ward dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* STOP TRANSFUSION — always top, always visible */}
      <div className={`rounded-xl border-2 p-6 transition-all ${stopped ? "border-gray-300 bg-gray-50" : "border-red-500 bg-red-50 shadow-xl"}`}>
        <div className="flex items-center gap-4">
          <AlertOctagon className={`w-10 h-10 flex-shrink-0 ${stopped ? "text-gray-400" : "text-red-600"}`} />
          <div className="flex-1">
            <div className={`text-xl font-black ${stopped ? "text-gray-600" : "text-red-700"}`}>
              {stopped ? "Transfusion Stopped" : "STOP TRANSFUSION"}
            </div>
            <div className={`text-sm ${stopped ? "text-gray-500" : "text-red-600"}`}>
              {stopped ? "Unit status changed to Suspended. Officer alerted." : "Tap immediately to suspend the transfusion and alert the blood bank."}
            </div>
          </div>
          {!stopped && (
            <Button variant="emergency" size="lg" onClick={handleStop} className="flex-shrink-0 text-lg px-8">
              STOP
            </Button>
          )}
          {stopped && (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Adverse Reaction Report</h1>
        <p className="text-gray-500 text-sm mt-1">Complete all sections. This report is immutable once submitted.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reaction Types */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">
            Reaction Type <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {REACTION_TYPES.map((r) => (
              <label key={r.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${reactionTypes.includes(r.id) ? "border-red-400 bg-red-50 text-red-800" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="checkbox"
                  checked={reactionTypes.includes(r.id)}
                  onChange={() => toggleReaction(r.id)}
                  className="text-red-600"
                />
                {r.label}
              </label>
            ))}
          </div>
          {errors.reactions && <p className="text-red-600 text-xs">{errors.reactions}</p>}
        </div>

        {/* Onset + Volume */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Onset (minutes from start) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={onsetMinutes}
              onChange={(e) => setOnsetMinutes(e.target.value)}
              placeholder="e.g. 15"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.onset && <p className="text-red-600 text-xs mt-1">{errors.onset}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Volume Transfused (mL) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={volumeMl}
              onChange={(e) => setVolumeMl(e.target.value)}
              placeholder="e.g. 150"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.volume && <p className="text-red-600 text-xs mt-1">{errors.volume}</p>}
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">Immediate Actions Taken</h3>
          <div className="grid grid-cols-2 gap-2">
            {IMMEDIATE_ACTIONS.map((a) => (
              <label key={a.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${immediateActions.includes(a.id) ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="checkbox"
                  checked={immediateActions.includes(a.id)}
                  onChange={() => toggleAction(a.id)}
                  className="text-green-600"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Additional Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional clinical observations..."
        />

        {/* Notification preview */}
        <div className="bg-gray-900 text-white rounded-lg p-4 text-sm">
          <div className="text-gray-400 text-xs uppercase mb-2">Automatic Actions on Submit</div>
          <div className="space-y-1 text-gray-300">
            <div>• Unit quarantined — barcode blocked from reissue until HOD clearance</div>
            <div>• HOD investigation case opened automatically</div>
            <div>• Blood Bank Officer alerted immediately</div>
            <div>• Requesting clinician notified of reaction</div>
            <div>• Lab tech assigned retrospective crossmatch verification</div>
          </div>
        </div>

        {errors.stop && <Alert variant="critical" title="Action Required" message={errors.stop} />}
        {errors.submit && <Alert variant="critical" title="Submission Error" message={errors.submit} />}

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" variant="destructive" size="lg" className="flex-1" disabled={submitting}>
            {submitting ? "Submitting Report..." : "Submit Adverse Reaction Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
