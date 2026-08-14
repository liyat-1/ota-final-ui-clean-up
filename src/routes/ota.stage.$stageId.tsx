import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  GitBranch,
  Mail,
  MessageSquare,
  Monitor,
  Pause,
  Play,
  Smartphone,
  Tag,
} from "lucide-react";
import { EmailPreview } from "@/components/editor/EmailPreview";
import { PhoneMockup } from "@/components/editor/PhoneMockup";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { Select } from "@/components/editor/Select";
import { Field, TextArea, TextInput } from "@/components/editor/controls";
import { ChannelBadge, SoftBadge, StageIcon } from "@/components/ota/JourneyPieces";
import { EmailOfferBlock, LandingOffer } from "@/components/ota/OfferBlock";
import { BranchBanner, LandingFieldsPreview } from "@/components/ota/StageMessageEditor";
import { CampaignSummary } from "@/components/ota/FeedbackSequenceBoard";
import { createStructuredCampaign, type Campaign } from "@/lib/campaign";
import {
  branchMessages,
  getStage,
  offerHeadlineValue,
  STAGES,
  trunkMessages,
  waitLabel,
  type FeedbackCondition,
  type Offer,
  type SequenceMessage,
  type Stage,
} from "@/lib/otaJourney";

type PreviewDevice = "desktop" | "mobile";
type Panel = "email" | "landing" | "success";

export const Route = createFileRoute("/ota/stage/$stageId")({
  validateSearch: (search: Record<string, unknown>): { preview?: boolean } =>
    search.preview === true || search.preview === "true" ? { preview: true } : {},
  loader: ({ params }) => {
    const stage = getStage(params.stageId);
    if (!stage) throw notFound();
    return { stageId: stage.id };
  },
  head: ({ params }) => {
    const stage = getStage(params.stageId);
    const name = stage?.name ?? "Stage";
    const title = `${name} campaign — OTA Buster · Directful`;
    const description = stage
      ? `${stage.purpose} Edit the ${name.toLowerCase()} message sequence, landing page, success screen and offer.`
      : "Edit an OTA Buster stage campaign: messages, landing page, success screen and offer.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StageWorkspace,
});

/* ----------------------------- preview model ---------------------------- */

function previewCampaign(stage: Stage, msg: SequenceMessage): Campaign {
  const c = createStructuredCampaign();
  c.meta.name = `${stage.name} · ${msg.name}`;
  c.meta.subject = msg.email.subject;
  c.meta.preheader = msg.email.preheader;
  c.header.logoText = "WYNDHAM GRAND";
  c.body.heading = msg.email.heading;
  c.body.paragraphs = msg.email.body.map((text, i) => ({ id: `p${i}`, text }));
  c.cta.label = msg.email.cta;
  c.details.visible = false;
  c.footer.company = "Wyndham Grand Istanbul Levent";
  c.footer.address = "Levent, Istanbul, Türkiye";
  return c;
}

/* -------------------------------- helpers ------------------------------- */

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12.5px] leading-snug">
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function PanelCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint ? <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/* -------------------------------- screen -------------------------------- */

function StageWorkspace() {
  const { stageId } = Route.useParams();
  const { preview } = Route.useSearch();
  const stage = getStage(stageId)!;

  const [messages, setMessages] = useState<SequenceMessage[]>(() =>
    stage.sequence.map((m) => ({ ...m })),
  );
  const [activeId, setActiveId] = useState(stage.sequence[0]!.id);
  const [panel, setPanel] = useState<Panel>("email");
  const [device, setDevice] = useState<PreviewDevice>(preview ? "mobile" : "desktop");
  const [paused, setPaused] = useState(stage.status === "paused");
  const [pauseOpen, setPauseOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wait, setWait] = useState<FeedbackCondition["wait"]>(
    () => stage.condition?.wait ?? { value: 2, unit: "days" },
  );

  const trunk = trunkMessages(messages);
  const branches = branchMessages(stage, messages);

  const msg = messages.find((m) => m.id === activeId) ?? messages[0]!;
  const campaign = useMemo(() => previewCampaign(stage, msg), [stage, msg]);

  const patch = (p: Partial<SequenceMessage>) =>
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, ...p } : m)));

  const patchOffer = (p: Partial<Offer>) => patch({ offer: { ...msg.offer, ...p } });

  const landingSubmitLabel = msg.offer.enabled
    ? msg.offer.cta.trim() || "Complete and claim offer"
    : msg.landing.submitLabel;

  const showText = msg.channel === "text" || msg.channel === "both";
  const showEmail = msg.channel === "email" || msg.channel === "both";

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <header className="border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <StageIcon stage={stage} />
            <div className="min-w-0">
              <Link
                to="/ota"
                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-blue-700 hover:underline"
              >
                <ArrowLeft size={12} /> Guest journey
              </Link>
              <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-slate-900">
                {stage.name} campaign
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
                {stage.purpose}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ChannelBadge channel={stage.channel} />
                <SoftBadge>{stage.campaignType}</SoftBadge>
                <SoftBadge tone={paused ? "warn" : "good"}>
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {paused ? "Paused" : "Active"}
                </SoftBadge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (paused ? setPaused(false) : setPauseOpen(true))}
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              {paused ? "Resume stage" : "Pause stage"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {saved ? <CheckCircle2 size={13} /> : null}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>

        <dl className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
          <div className="bg-white p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Guests enter when
            </dt>
            <dd className="mt-1 text-[12.5px] leading-snug text-slate-700">
              {stage.transition.startsWhen}
            </dd>
          </div>
          <div className="bg-white p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Who is eligible
            </dt>
            <dd className="mt-1 space-y-1 text-[12.5px] leading-snug text-slate-700">
              {stage.eligibility.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </dd>
          </div>
          <div className="bg-white p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              The stage is complete when
            </dt>
            <dd className="mt-1 space-y-1 text-[12.5px] leading-snug text-slate-700">
              {stage.completion.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </dd>
          </div>
        </dl>
      </header>

      {stage.condition ? <CampaignSummary stage={stage} /> : null}

      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Sequence list */}
        <aside className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Message sequence
          </p>

          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <GitBranch size={12} /> Initial
            </p>
            <ol className="space-y-2">
              {trunk.map((m, i) => {
                const active = m.id === msg.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(m.id)}
                      aria-current={active}
                      className={`w-full border p-3 text-left transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-50/60"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid size-5 shrink-0 place-items-center bg-slate-900 text-[10px] font-bold text-white">
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
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-snug text-slate-500">{m.timing}</p>
                      {m.offer.enabled ? (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Tag size={11} /> {offerHeadlineValue(m.offer)}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {branches.length > 0 ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Clock size={12} /> Guest feedback
              </p>
              <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2">
                <Clock size={12} className="text-slate-400" />
                <span className="text-[12px] text-slate-600">Wait</span>
                <input
                  type="number"
                  min={1}
                  value={wait.value}
                  onChange={(e) =>
                    setWait((w) => ({ ...w, value: Math.max(1, Number(e.target.value) || 1) }))
                  }
                  className="h-8 w-14 rounded-md border border-slate-200 px-2 text-center text-[12px] tabular-nums outline-none focus:border-slate-400"
                />
                <div className="w-24">
                  <Select
                    value={wait.unit}
                    options={[
                      { value: "hours", label: "hours" },
                      { value: "days", label: "days" },
                      { value: "weeks", label: "weeks" },
                    ]}
                    onChange={(v) =>
                      setWait((w) => ({ ...w, unit: v as FeedbackCondition["wait"]["unit"] }))
                    }
                    ariaLabel="Wait unit"
                    size="sm"
                  />
                </div>
                <span className="ml-auto text-[11px] text-slate-400">
                  Reminder after {waitLabel(wait)}
                </span>
              </div>
              <ol className="space-y-2">
                {branches.map((m) => {
                  const active = m.id === msg.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(m.id)}
                        aria-current={active}
                        className={`w-full border p-3 text-left transition-colors ${
                          active
                            ? "border-blue-600 bg-blue-50/60"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid size-5 shrink-0 place-items-center text-[10px] font-bold text-white ${
                              m.branch?.tone === "good"
                                ? "bg-emerald-600"
                                : m.branch?.tone === "warn"
                                  ? "bg-amber-600"
                                  : "bg-slate-600"
                            }`}
                          >
                            {m.branch?.key === "positive"
                              ? "+"
                              : m.branch?.key === "negative"
                                ? "−"
                                : "?"}
                          </span>
                          <span className="truncate text-[13px] font-semibold text-slate-900">
                            {m.name}
                          </span>
                          {m.channel === "text" ? (
                            <MessageSquare size={12} className="ml-auto text-slate-400" />
                          ) : (
                            <Mail size={12} className="ml-auto text-slate-400" />
                          )}
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-snug text-slate-500">{m.timing}</p>
                        {m.offer.enabled ? (
                          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <Tag size={11} /> {offerHeadlineValue(m.offer)}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          <div className="border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              In plain language
            </p>
            <div className="mt-2 space-y-1.5">
              <ConditionRow label="Send when" value={msg.sendWhen} />
              <ConditionRow label="Stop when" value={msg.stopWhen} />
              <ConditionRow label="Skip when" value={msg.skipWhen} />
            </div>
          </div>
        </aside>

        {/* Editor + preview */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <BranchBanner msg={msg} />
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {(
                [
                  ["email", "Email"],
                  ["landing", "Landing"],
                  ["success", "Success"],
                ] as [Panel, string][]
              ).map(([id, label]) => (

                <button
                  key={id}
                  type="button"
                  onClick={() => setPanel(id)}
                  aria-pressed={panel === id}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    panel === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}

                >
                  {label}
                </button>
              ))}
            </div>

            {panel === "email" ? (
              <PanelCard
                title="Message content"
                hint="Use {{first_name}} and other tokens — they render in the preview."
              >
                <Field label="Timing">
                  <TextInput value={msg.timing} onChange={(v) => patch({ timing: v })} />
                </Field>
                <Field label="Channel">
                  <Select
                    value={msg.channel}
                    options={[
                      { value: "email", label: "Email" },
                      { value: "text", label: "Text" },
                      { value: "both", label: "Email + Text" },
                    ]}
                    onChange={(v) => patch({ channel: v })}
                    ariaLabel="Message channel"
                  />
                </Field>
                {showEmail ? (
                  <>
                    <Field label="Subject line">
                      <TextInput
                        value={msg.email.subject}
                        onChange={(v) => patch({ email: { ...msg.email, subject: v } })}
                      />
                    </Field>
                    <Field label="Preheader">
                      <TextInput
                        value={msg.email.preheader}
                        onChange={(v) => patch({ email: { ...msg.email, preheader: v } })}
                      />
                    </Field>
                    <Field label="Heading">
                      <TextInput
                        value={msg.email.heading}
                        onChange={(v) => patch({ email: { ...msg.email, heading: v } })}
                      />
                    </Field>
                    <Field label="Body" hint="One paragraph per blank line">
                      <TextArea
                        rows={6}
                        value={msg.email.body.join("\n\n")}
                        onChange={(v) =>
                          patch({
                            email: { ...msg.email, body: v.split(/\n{2,}/).filter(Boolean) },
                          })
                        }
                      />
                    </Field>
                    <Field label="Button label">
                      <TextInput
                        value={msg.email.cta}
                        onChange={(v) => patch({ email: { ...msg.email, cta: v } })}
                      />
                    </Field>
                  </>
                ) : null}
                {showText ? (
                  <Field label="Text message">
                    <TextArea rows={3} value={msg.text} onChange={(v) => patch({ text: v })} />
                  </Field>
                ) : null}

                {/* Offer folded into the email panel */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-900">Attached offer</p>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                        Shown inside the email and on the landing page.
                      </p>
                    </div>
                    <label className="flex shrink-0 items-center gap-2 text-[12px] font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={msg.offer.enabled}
                        onChange={(e) => patchOffer({ enabled: e.target.checked })}
                      />
                      Enabled
                    </label>
                  </div>

                  {msg.offer.enabled ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Offer type">
                          <Select
                            value={msg.offer.kind}
                            options={[
                              { value: "percent", label: "Percentage off" },
                              { value: "amount", label: "Amount off" },
                              { value: "inclusion", label: "Included extra" },
                            ]}
                            onChange={(v) => patchOffer({ kind: v })}
                            ariaLabel="Offer type"
                          />
                        </Field>
                        <Field label="Value">
                          <TextInput
                            value={msg.offer.value}
                            onChange={(v) => patchOffer({ value: v })}
                          />
                        </Field>
                      </div>
                      <Field label="Title">
                        <TextInput value={msg.offer.title} onChange={(v) => patchOffer({ title: v })} />
                      </Field>
                      <Field label="Description">
                        <TextArea
                          rows={2}
                          value={msg.offer.description}
                          onChange={(v) => patchOffer({ description: v })}
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Validity">
                          <TextInput
                            value={msg.offer.validity}
                            onChange={(v) => patchOffer({ validity: v })}
                          />
                        </Field>
                        <Field label="Offer button">
                          <TextInput value={msg.offer.cta} onChange={(v) => patchOffer({ cta: v })} />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">
                      No offer attached. This message informs the guest without a promotion.
                    </p>
                  )}
                </div>
              </PanelCard>
            ) : null}


            {panel === "landing" ? (
              <PanelCard title="Landing page" hint="Where the guest lands after tapping the button.">
                <Field label="Headline">
                  <TextInput
                    value={msg.landing.headline}
                    onChange={(v) => patch({ landing: { ...msg.landing, headline: v } })}
                  />
                </Field>
                <Field label="Supporting text">
                  <TextArea
                    rows={2}
                    value={msg.landing.subtext}
                    onChange={(v) => patch({ landing: { ...msg.landing, subtext: v } })}
                  />
                </Field>
                <Field
                  label="Submit button"
                  hint={
                    msg.offer.enabled
                      ? `Offer attached — guests see “${landingSubmitLabel}”`
                      : undefined
                  }
                >

                  <TextInput
                    value={msg.landing.submitLabel}
                    onChange={(v) => patch({ landing: { ...msg.landing, submitLabel: v } })}
                  />
                </Field>
                <div>
                  <p className="text-[12px] font-medium text-slate-600">Fields the guest fills in</p>
                  <ul className="mt-2 divide-y divide-slate-100 border border-slate-200">
                    {msg.landing.fields.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="text-[12.5px] text-slate-800">{f.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-slate-400">
                            {f.type}
                          </span>
                          <label className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                            <input
                              type="checkbox"
                              checked={f.required}
                              onChange={(e) =>
                                patch({
                                  landing: {
                                    ...msg.landing,
                                    fields: msg.landing.fields.map((x) =>
                                      x.id === f.id ? { ...x, required: e.target.checked } : x,
                                    ),
                                  },
                                })
                              }
                            />
                            Required
                          </label>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </PanelCard>
            ) : null}

            {panel === "success" ? (
              <PanelCard title="Success screen" hint="Shown once the guest submits the form.">
                <Field label="Headline">
                  <TextInput
                    value={msg.success.headline}
                    onChange={(v) => patch({ success: { ...msg.success, headline: v } })}
                  />
                </Field>
                <Field label="Message">
                  <TextArea
                    rows={3}
                    value={msg.success.message}
                    onChange={(v) => patch({ success: { ...msg.success, message: v } })}
                  />
                </Field>
                <Field label="Next step button">
                  <TextInput
                    value={msg.success.cta}
                    onChange={(v) => patch({ success: { ...msg.success, cta: v } })}
                  />
                </Field>
              </PanelCard>
            ) : null}
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Eye size={12} /> Live preview
              </p>
              {panel === "email" && showEmail ? (
                <div className="flex bg-slate-100 p-0.5">
                  {(
                    [
                      ["desktop", Monitor, "Desktop"],
                      ["mobile", Smartphone, "Mobile"],
                    ] as [PreviewDevice, typeof Monitor, string][]
                  ).map(([id, Icon, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDevice(id)}
                      aria-pressed={device === id}
                      aria-label={label}
                      className={`grid size-7 place-items-center transition-colors ${
                        device === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
              {panel === "email" ? (
                showEmail ? (
                  device === "mobile" ? (
                    <PhoneMockup scale={0.78}>
                      <EmailPreview
                        campaign={campaign}
                        interactive={false}
                        width={373}
                        beforeFooter={<EmailOfferBlock offer={msg.offer} />}
                      />
                    </PhoneMockup>
                  ) : (
                    <EmailPreview
                      campaign={campaign}
                      interactive={false}
                      width={440}
                      beforeFooter={<EmailOfferBlock offer={msg.offer} />}
                    />
                  )
                ) : (
                  <SmsPreview message={msg.text} link="https://stay.wyndhamgrand.com/c" sender="Wyndham Grand" />
                )
              ) : null}

              {panel === "landing" ? (
                <PhoneMockup scale={0.78} contentClassName="bg-white">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4 px-5 py-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Wyndham Grand
                      </p>
                      <h4 className="text-[20px] font-semibold leading-tight tracking-tight text-zinc-900">
                        {msg.landing.headline}
                      </h4>
                      <p className="text-[13px] leading-relaxed text-zinc-500">
                        {msg.landing.subtext}
                      </p>
                      <LandingFieldsPreview fields={msg.landing.fields} />
                      <div className="mt-2 grid h-10 place-items-center rounded-lg bg-blue-600 text-[13px] font-semibold text-white">
                        {landingSubmitLabel}
                      </div>
                      <LandingOffer offer={msg.offer} />
                    </div>
                  </div>
                </PhoneMockup>
              ) : null}

              {panel === "success" ? (
                <PhoneMockup scale={0.78} contentClassName="bg-white">
                  <div className="grid h-full place-items-center px-6 text-center">
                    <div>
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={24} />
                      </span>
                      <h4 className="mt-4 text-[19px] font-semibold tracking-tight text-zinc-900">
                        {msg.success.headline}
                      </h4>
                      <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                        {msg.success.message}
                      </p>
                      <div className="mt-5 grid h-10 place-items-center rounded-lg border border-zinc-300 text-[13px] font-semibold text-zinc-800">
                        {msg.success.cta}
                      </div>
                    </div>
                  </div>
                </PhoneMockup>
              ) : null}
            </div>

          </div>
        </div>
      </div>

      {/* Other stages */}
      <nav aria-label="Other stages" className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        {STAGES.filter((s) => s.id !== stage.id).map((s) => (
          <Link
            key={s.id}
            to="/ota/stage/$stageId"
            params={{ stageId: s.id }}
            className="border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            {s.name}
          </Link>
        ))}
      </nav>

      {pauseOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-label="Pause stage"
            className="w-full max-w-md border border-slate-300 bg-white p-5 shadow-2xl"
          >
            <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">
              Pause the {stage.name} stage?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Guests already in this stage stop receiving its messages. New guests keep entering the
              journey and move on to the next eligible stage. Nothing is deleted — you can resume at
              any time.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPauseOpen(false)}
                className="border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 hover:border-slate-400"
              >
                Keep it running
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaused(true);
                  setPauseOpen(false);
                }}
                className="bg-amber-600 px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-amber-700"
              >
                Pause stage
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
