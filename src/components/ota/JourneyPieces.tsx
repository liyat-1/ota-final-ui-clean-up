import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck2,
  Clock3,
  Eye,
  Mail,
  MessageSquare,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";
import {
  CHANNEL_LABEL,
  stageMetrics,
  type Channel,
  type Period,
  type Stage,
} from "@/lib/otaJourney";

export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-medium text-slate-600">
      {channel === "text" ? <MessageSquare size={12} /> : <Mail size={12} />}
      {CHANNEL_LABEL[channel]}
    </span>
  );
}

export function SoftBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "info" }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11.5px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StageIcon({ stage }: { stage: Stage }) {
  const Icon =
    stage.icon === "booked"
      ? CalendarCheck2
      : stage.icon === "prearrival"
        ? Clock3
        : stage.icon === "stay"
          ? BedDouble
          : stage.icon === "checkout"
            ? Star
            : Repeat2;
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${stage.accent}`}>
      <Icon size={17} />
    </span>
  );
}

export function Momentum({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/** Vertical connector that explains *why and when* the next stage begins. */
export function TransitionRail({ stage }: { stage: Stage }) {
  return (
    <div className="relative pl-[27px]">
      <span aria-hidden className="absolute left-[27px] top-0 h-full w-px bg-slate-200" />
      <div className="relative ml-5 my-3 max-w-3xl rounded-xl border border-slate-200 bg-blue-50/40 p-3.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Next stage
          </span>
          <span className="text-[13px] font-semibold text-slate-900">{stage.name}</span>
        </div>
        <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          <div className="flex gap-2 text-[12.5px]">
            <dt className="shrink-0 text-slate-500">Target</dt>
            <dd className="font-medium text-slate-800">{stage.transition.target}</dd>
          </div>
          <div className="flex gap-2 text-[12.5px]">
            <dt className="shrink-0 text-slate-500">Starts when</dt>
            <dd className="font-medium text-slate-800">{stage.transition.startsWhen}</dd>
          </div>
          <div className="flex gap-2 text-[12.5px]">
            <dt className="shrink-0 text-slate-500">Window</dt>
            <dd className="font-medium text-slate-800">{stage.transition.window}</dd>
          </div>
          <div className="flex gap-2 text-[12.5px]">
            <dt className="shrink-0 text-slate-500">If eligible late</dt>
            <dd className="font-medium text-slate-800">
              {stage.transition.fallback === "skip" ? "Skip this stage" : "Send when eligible"}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-[12px] leading-snug text-slate-500">{stage.transition.note}</p>
      </div>
    </div>
  );
}

export function StageCard({
  stage,
  period,
  onPreview,
  onEdit,
}: {
  stage: Stage;
  period: Period;
  onPreview?: () => void;
  onEdit?: () => void;
}) {
  const m = stageMetrics(stage.id, period);
  const paused = stage.status === "paused";

  return (
    <article className="relative rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_6px_20px_-12px_rgba(15,23,42,0.25)]">

      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <StageIcon stage={stage} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">{stage.name}</h3>
                <span className="text-[12.5px] text-slate-500">{stage.subtitle}</span>
                <ChannelBadge channel={stage.channel} />
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{stage.guestLine}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SoftBadge>{stage.campaignType}</SoftBadge>
                <SoftBadge>
                  {stage.sequence.some((s) => s.offer.enabled) ? "Offer attached" : "No offer attached"}
                </SoftBadge>
                <SoftBadge tone={paused ? "warn" : "good"}>
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {paused ? "Paused" : "Active"}
                </SoftBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {onPreview ? (
                  <button
                    type="button"
                    onClick={onPreview}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
                  >
                    <Eye size={13} /> Preview
                  </button>
                ) : (
                  <Link
                    to="/ota/stage/$stageId"
                    params={{ stageId: stage.id }}
                    search={{ preview: true }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
                  >
                    <Eye size={13} /> Preview
                  </Link>
                )}
                {onEdit ? (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Edit stage campaign <ArrowRight size={13} />
                  </button>
                ) : (
                  <Link
                    to="/ota/stage/$stageId"
                    params={{ stageId: stage.id }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Edit stage campaign <ArrowRight size={13} />
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px rounded-b-xl bg-slate-100 lg:rounded-l-none lg:rounded-r-xl">
          <div className="bg-slate-50/60 p-4 lg:rounded-tr-none">
            <p className="text-[11px] font-medium text-slate-500">{m.primary.label}</p>
            <p className="mt-1 text-[19px] font-semibold tabular-nums tracking-tight text-slate-900">
              {m.primary.value}
            </p>
            <span className="mt-0.5 flex items-center gap-1.5">
              <Momentum value={m.primary.momentum} />
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-slate-400">Momentum</span>
            </span>
          </div>
          {m.rest.map((r) => (
            <div key={r.label} className="bg-slate-50/60 p-4">
              <p className="text-[11px] font-medium text-slate-500">{r.label}</p>
              <p className="mt-1 text-[19px] font-semibold tabular-nums tracking-tight text-slate-900">
                {r.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {stage.branches ? (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <Sparkles size={12} /> Branches
          </span>
          {stage.branches.map((b) => (
            <SoftBadge key={b.label} tone={b.tone === "good" ? "good" : b.tone === "warn" ? "warn" : "neutral"}>
              {b.label}
            </SoftBadge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
