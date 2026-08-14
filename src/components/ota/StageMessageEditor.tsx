import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Monitor, Smartphone, Star } from "lucide-react";
import { EmailPreview } from "@/components/editor/EmailPreview";
import { PhoneMockup } from "@/components/editor/PhoneMockup";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { Select } from "@/components/editor/Select";
import { Field, TextArea, TextInput } from "@/components/editor/controls";
import { EmailOfferBlock, LandingOffer } from "@/components/ota/OfferBlock";
import { createStructuredCampaign, type Campaign } from "@/lib/campaign";
import type { LandingField, Offer, SequenceMessage, Stage } from "@/lib/otaJourney";

export type Panel = "email" | "landing" | "success";
export type PreviewDevice = "desktop" | "mobile";

export const PANELS: [Panel, string][] = [
  ["email", "Email"],
  ["landing", "Landing"],
  ["success", "Success"],
];

export function previewCampaign(stage: Stage, msg: SequenceMessage): Campaign {
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

export function landingLabel(msg: SequenceMessage) {
  return msg.offer.enabled
    ? msg.offer.cta.trim() || "Complete and claim offer"
    : msg.landing.submitLabel;
}

/** Guest-facing rendering of the landing form fields, shared by every preview. */
export function LandingFieldsPreview({ fields }: { fields: LandingField[] }) {
  return (
    <div className="space-y-3 pt-1">
      {fields.map((f) => (
        <div key={f.id}>
          <p className="mb-1 text-[11.5px] font-medium text-zinc-600">
            {f.label}
            {f.required ? <span className="text-rose-500"> *</span> : null}
          </p>
          {f.type === "rating" ? (
            <div className="flex gap-1.5 text-amber-500">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={24} strokeWidth={1.5} />
              ))}
            </div>
          ) : f.type === "review" ? (
            <div className="flex h-9 items-center justify-between rounded-lg border border-zinc-300 px-3 text-[11.5px] font-medium text-zinc-600">
              Post on Google <span aria-hidden>→</span>
            </div>
          ) : (
            <div
              className={`rounded-lg border border-zinc-300 bg-zinc-50 ${
                f.type === "textarea" ? "h-16" : "h-9"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Explains which guests receive the message being edited. */
export function BranchBanner({ msg }: { msg: SequenceMessage }) {
  const b = msg.branch;
  if (!b) return null;
  const tone =
    b.tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : b.tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="text-[13px] font-semibold">
        {b.label} <span className="font-medium opacity-70">· {b.range}</span>
      </p>
      <p className="mt-0.5 text-[12px] leading-snug opacity-80">{b.note}</p>
    </div>
  );
}

export function PanelTabs({
  panel,
  onChange,
}: {
  panel: Panel;
  onChange: (p: Panel) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {PANELS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={panel === id}
          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            panel === id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {label}
        </button>
      ))}
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
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint ? <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/** The three guest-facing screens, rendered inside phone / desktop frames. */
export function StageScreens({
  stage,
  msg,
  panel,
  device,
}: {
  stage: Stage;
  msg: SequenceMessage;
  panel: Panel;
  device: PreviewDevice;
}) {
  const campaign = useMemo(() => previewCampaign(stage, msg), [stage, msg]);
  const showEmail = msg.channel === "email" || msg.channel === "both";

  if (panel === "email") {
    if (!showEmail) {
      return (
        <SmsPreview message={msg.text} link="https://stay.wyndhamgrand.com/c" sender="Wyndham Grand" />
      );
    }
    return device === "mobile" ? (
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
    );
  }

  if (panel === "landing") {
    return (
      <PhoneMockup scale={0.78} contentClassName="bg-white">
        <div className="h-full overflow-y-auto">
          <div className="space-y-4 px-5 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Wyndham Grand
            </p>
            <h4 className="text-[20px] font-semibold leading-tight tracking-tight text-zinc-900">
              {msg.landing.headline}
            </h4>
            <p className="text-[13px] leading-relaxed text-zinc-500">{msg.landing.subtext}</p>
            <LandingFieldsPreview fields={msg.landing.fields} />
            <div className="mt-2 grid h-10 place-items-center rounded-lg bg-blue-600 text-[13px] font-semibold text-white">
              {landingLabel(msg)}
            </div>
            <LandingOffer offer={msg.offer} />
          </div>
        </div>
      </PhoneMockup>
    );
  }

  return (
    <PhoneMockup scale={0.78} contentClassName="bg-white">
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={24} />
          </span>
          <h4 className="mt-4 text-[19px] font-semibold tracking-tight text-zinc-900">
            {msg.success.headline}
          </h4>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{msg.success.message}</p>
          <div className="mt-5 grid h-10 place-items-center rounded-lg border border-zinc-300 text-[13px] font-semibold text-zinc-800">
            {msg.success.cta}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

/** Preview column with its own device toggle. */
export function StagePreviewPane({
  stage,
  msg,
  panel,
  initialDevice = "desktop",
}: {
  stage: Stage;
  msg: SequenceMessage;
  panel: Panel;
  initialDevice?: PreviewDevice;
}) {
  const [device, setDevice] = useState<PreviewDevice>(initialDevice);
  const showEmail = msg.channel === "email" || msg.channel === "both";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Eye size={12} /> Live preview
        </p>
        {panel === "email" && showEmail ? (
          <div className="flex rounded-lg bg-slate-100 p-0.5">
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
                className={`grid size-7 place-items-center rounded-md transition-colors ${
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
        <StageScreens stage={stage} msg={msg} panel={panel} device={device} />
      </div>
    </div>
  );
}

/**
 * Editor for one sequence message: Email / Landing / Success forms on the left,
 * the matching live preview on the right.
 */
export function StageMessageEditor({
  stage,
  msg,
  patch,
  initialDevice,
}: {
  stage: Stage;
  msg: SequenceMessage;
  patch: (p: Partial<SequenceMessage>) => void;
  initialDevice?: PreviewDevice;
}) {
  const [panel, setPanel] = useState<Panel>("email");
  const patchOffer = (p: Partial<Offer>) => patch({ offer: { ...msg.offer, ...p } });
  const showText = msg.channel === "text" || msg.channel === "both";
  const showEmail = msg.channel === "email" || msg.channel === "both";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <BranchBanner msg={msg} />
        <PanelTabs panel={panel} onChange={setPanel} />

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
                      patch({ email: { ...msg.email, body: v.split(/\n{2,}/).filter(Boolean) } })
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
                      <TextInput value={msg.offer.value} onChange={(v) => patchOffer({ value: v })} />
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
                msg.offer.enabled ? `Offer attached — guests see “${landingLabel(msg)}”` : undefined
              }
            >
              <TextInput
                value={msg.landing.submitLabel}
                onChange={(v) => patch({ landing: { ...msg.landing, submitLabel: v } })}
              />
            </Field>
            <div>
              <p className="text-[12px] font-medium text-slate-600">Fields the guest fills in</p>
              <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
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

      <StagePreviewPane stage={stage} msg={msg} panel={panel} initialDevice={initialDevice} />
    </div>
  );
}
