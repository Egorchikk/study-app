import type { ReactNode } from "react";
import { openBotSettings } from "../lib/actions";
import { LANGS, t, type Lang } from "../lib/i18n";
import { ACCENTS, MODES, SOON_OPTIONS, START_TABS, TEXT_SIZES } from "../lib/settings";
import { cloud, hapticSelection } from "../lib/telegram";
import type { Course } from "../lib/types";
import { useSettings } from "../store/useSettings";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { Icon } from "../components/Icon";
import { ScreenTitle } from "../components/ScreenTitle";
import { Tile } from "../components/Tile";

const LANG_NAMES: Record<Lang, string> = { ru: "Русский", en: "English" };

function Field({ label, hint, children }: { label?: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <div className="px-5 py-3.5">
      {label && <p className="mb-2.5 text-[15px] leading-snug font-medium">{label}</p>}
      {children}
      {hint && <p className="mt-2.5 text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

function Choice<T extends string | number>({ label, options, value, onChange, format, wrap = false }: { label: string; options: readonly T[]; value: T; onChange(value: T): void; format(value: T): string; wrap?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={wrap ? "flex flex-wrap gap-2" : "grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-raised p-1"}>
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (active) return;
              hapticSelection();
              onChange(option);
            }}
            className={`pressable min-h-9 rounded-full text-[14px] font-semibold whitespace-nowrap ${wrap ? "px-4" : "px-1"} ${active ? "bg-primary text-on-primary" : wrap ? "bg-raised text-ink" : "text-ink"}`}
          >
            {format(option)}
          </button>
        );
      })}
    </div>
  );
}

function Knob({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`relative block h-[30px] w-[50px] shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-control"}`}>
      <span className={`absolute top-[3px] left-[3px] block h-6 w-6 rounded-full shadow-sm transition-transform ${on ? "translate-x-5 bg-on-primary" : "bg-white"}`} />
    </span>
  );
}

function SwitchRow({ on, onChange, lead, title, hint, dim = false }: { on: boolean; onChange(on: boolean): void; lead?: ReactNode; title: string; hint?: string; dim?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        hapticSelection();
        onChange(!on);
      }}
      className="pressable flex min-h-[60px] w-full items-center gap-3 px-5 py-2.5 text-left"
    >
      {lead}
      <span className="min-w-0 flex-1">
        <span className={`line-clamp-2 block text-[15px] leading-snug font-medium ${dim ? "text-muted" : ""}`}>{title}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{hint}</span>}
      </span>
      <Knob on={on} />
    </button>
  );
}

export function SettingsScreen({ courses, bot }: { courses: Course[]; bot: string }) {
  const { settings, update, reset } = useSettings();
  const s = t().settings;
  const tabs = t().tabs;
  const hidden = new Set(settings.hidden);
  const shown = courses.filter((c) => !hidden.has(c.id)).length;

  const toggleCourse = (id: string, on: boolean) => {
    update({ hidden: on ? settings.hidden.filter((h) => h !== id) : [...settings.hidden, id] });
  };

  return (
    <div>
      <ScreenTitle title={s.title} />
      <div className="flex flex-col gap-4 px-4 pb-4 lg:px-0">
        <Card>
          <CardHeader title={s.look} />
          <div className="divide-y divide-rule pb-1">
            <Field label={s.mode} hint={s.modeHint}>
              <Choice label={s.mode} options={MODES} value={settings.mode} onChange={(mode) => update({ mode })} format={(m) => s.modes[m]} />
            </Field>
            <Field
              label={
                <>
                  {s.accent} <span className="font-normal text-muted">· {s.accents[settings.accent]}</span>
                </>
              }
            >
              <div role="radiogroup" aria-label={s.accent} className="flex flex-wrap gap-3 py-1 pl-1">
                {ACCENTS.map((accent) => {
                  const active = accent === settings.accent;
                  return (
                    <button
                      key={accent}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={s.accents[accent]}
                      data-accent={accent}
                      onClick={() => {
                        if (active) return;
                        hapticSelection();
                        update({ accent });
                      }}
                      className={`pressable swatch flex h-11 w-11 items-center justify-center rounded-full ${active ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
                    >
                      {active && <Icon name="done" size={20} className="text-[oklch(0.25_0.05_var(--h))]" />}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label={s.textSize}>
              <Choice label={s.textSize} options={TEXT_SIZES} value={settings.textSize} onChange={(textSize) => update({ textSize })} format={(size) => s.textSizes[size]} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title={s.language} />
          <Field hint={s.languageHint}>
            <Choice label={s.language} options={LANGS} value={settings.lang} onChange={(lang) => update({ lang })} format={(lang) => LANG_NAMES[lang]} />
          </Field>
        </Card>

        <Card>
          <CardHeader title={s.comfort} />
          <div className="divide-y divide-rule pb-1">
            <Field label={s.startTab}>
              <Choice label={s.startTab} options={START_TABS} value={settings.startTab} onChange={(startTab) => update({ startTab })} format={(tab) => tabs[tab]} wrap />
            </Field>
            <Field label={s.soonDays} hint={s.soonHint}>
              <Choice label={s.soonDays} options={SOON_OPTIONS} value={settings.soonDays} onChange={(soonDays) => update({ soonDays })} format={String} />
            </Field>
            <SwitchRow on={settings.haptics} onChange={(haptics) => update({ haptics })} title={s.haptics} hint={s.hapticsHint} />
          </div>
        </Card>

        {bot && (
          <Card>
            <CardHeader title={s.notify}>{s.notifyHint}</CardHeader>
            <div className="px-5 pt-3 pb-5">
              <Button variant="secondary" size="sm" onClick={() => openBotSettings(bot)}>
                <Icon name="forum" size={16} />
                {s.notifyOpen}
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title={s.courses} aside={courses.length > 0 ? <span className="num text-[14px] text-muted">{s.shown(shown, courses.length)}</span> : undefined}>
            {s.coursesHint}
          </CardHeader>
          {courses.length > 0 ? (
            <ul className="divide-y divide-rule pt-1 pb-1">
              {courses.map((c) => {
                const on = !hidden.has(c.id);
                return (
                  <li key={c.id}>
                    <SwitchRow
                      on={on}
                      onChange={(next) => toggleCourse(c.id, next)}
                      lead={
                        <span className={on ? "" : "opacity-45"}>
                          <Tile code={c.short} />
                        </span>
                      }
                      title={c.name}
                      dim={!on}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 pt-1 pb-4 text-[15px] leading-snug text-muted">{s.coursesEmpty}</p>
          )}
        </Card>

        <div className="flex flex-col items-start gap-1 px-1">
          <Button variant="ghost" size="sm" className="-ml-4" onClick={reset}>
            <Icon name="refresh" size={16} />
            {s.reset}
          </Button>
          <p className="text-[13px] leading-snug text-muted">{cloud.available ? s.storedCloud : s.storedLocal}</p>
        </div>
      </div>
    </div>
  );
}
