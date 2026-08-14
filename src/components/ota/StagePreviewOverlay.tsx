import { useMemo, useState } from "react";
import { Mail, MessageSquare, X } from "lucide-react";
import {
  PanelTabs,
  StageScreens,
  panelsFor,
  type Panel,
} from "@/components/ota/StageMessageEditor";
import type { Stage } from "@/lib/otaJourney";

/** Read-only guest-eye view of a stage, layered over the journey. */
export function StagePreviewOverlay({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const [activeId, setActiveId] = useState(stage.sequence[0]!.id);
  const msg = stage.sequence.find((m) => m.id === activeId) ?? stage.sequence[0]!;
  const panels = useMemo(() => panelsFor(msg), [msg]);
  const [panel, setPanel] = useState<Panel>("email");
  const active = panels.some(([id]) => id === panel) ? panel : panels[0]![0];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={`${stage.name} preview`}
        className="flex h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Guest experience
            </p>
            <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {stage.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </header>

        {/* Sequence switcher — one clean row of pills */}
        <div className="shrink-0 border-b border-slate-200 px-5 py-3">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {stage.sequence.map((m, i) => {
              const on = m.id === msg.id;
              const Icon = m.channel === "text" ? MessageSquare : Mail;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveId(m.id)}
                  aria-pressed={on}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-left transition-colors ${
                    on
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                      on ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] font-semibold">{m.name}</span>
                  <Icon size={12} className={on ? "text-white/70" : "text-slate-400"} />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11.5px] text-slate-500">{msg.timing}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
          <div className="flex shrink-0 justify-center border-b border-slate-200 bg-white/70 px-4 py-2.5 backdrop-blur">
            <PanelTabs panel={active} onChange={setPanel} panels={panels} />
          </div>
          <div className="grid min-h-0 flex-1 place-items-center overflow-y-auto p-6">
            <StageScreens stage={stage} msg={msg} panel={active} device="mobile" />
          </div>
        </div>
      </div>
    </div>
  );
}
