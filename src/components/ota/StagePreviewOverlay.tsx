import { useState } from "react";
import { Mail, MessageSquare, X } from "lucide-react";
import { PanelTabs, StageScreens, type Panel } from "@/components/ota/StageMessageEditor";
import type { Stage } from "@/lib/otaJourney";

/** Read-only guest-eye view of a stage, layered over the journey. */
export function StagePreviewOverlay({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const [activeId, setActiveId] = useState(stage.sequence[0]!.id);
  const [panel, setPanel] = useState<Panel>("email");
  const msg = stage.sequence.find((m) => m.id === activeId) ?? stage.sequence[0]!;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={`${stage.name} preview`}
        className="flex h-[92vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Preview
            </p>
            <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {stage.name} campaign
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

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="min-h-0 space-y-2 overflow-y-auto border-r border-slate-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Message sequence
            </p>
            {stage.sequence.map((m, i) => {
              const active = m.id === msg.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveId(m.id)}
                  aria-current={active}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-50/60"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded bg-slate-900 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="truncate text-[13px] font-semibold text-slate-900">
                      {m.name}
                    </span>
                    {m.channel === "text" ? (
                      <MessageSquare size={12} className="ml-auto text-slate-400" />
                    ) : (
                      <Mail size={12} className="ml-auto text-slate-400" />
                    )}
                  </span>
                  <span className="mt-1.5 block text-[11.5px] leading-snug text-slate-500">
                    {m.timing}
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="flex min-h-0 flex-col bg-slate-50">
            <div className="shrink-0 border-b border-slate-200 bg-white/70 px-4 py-2.5 backdrop-blur">
              <PanelTabs panel={panel} onChange={setPanel} />
            </div>
            <div className="grid min-h-0 flex-1 place-items-center overflow-y-auto p-6">
              <StageScreens stage={stage} msg={msg} panel={panel} device="mobile" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
