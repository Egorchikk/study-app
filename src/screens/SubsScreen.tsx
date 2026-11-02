import { useCallback, useMemo, useState, type ReactNode } from "react";
import { formatLongDate, parseISO, plural } from "../lib/dates";
import { saveSetting } from "../lib/settings";
import { SUB_NAME_MAX, addCommand, daysLeft, deleteCommand, formatPrice, isDay, parsePrice, sortSubs, untilText } from "../lib/subs";
import { hapticNotify, hapticSelection } from "../lib/telegram";
import type { Subscription } from "../lib/types";
import { useBackButton } from "../lib/useBackButton";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { ScreenTitle } from "../components/ScreenTitle";
import { Sheet } from "../components/Sheet";

interface Props {
  subs: Subscription[];
  now: Date;
  onChanged(): void;
}

type SheetState = { kind: "add" } | { kind: "sub"; sub: Subscription } | null;

const inputClass = "min-h-12 w-full rounded-2xl bg-raised px-4 text-left text-[16px] outline-none placeholder:text-muted focus:ring-2 focus:ring-accent";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function AddForm({ onSaved }: { onSaved(): void }) {
  const [name, setName] = useState("");
  const [until, setUntil] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const value = parsePrice(price);
  const valid = name.trim().length > 0 && isDay(until) && value !== null;

  const save = async () => {
    if (!valid || saving || value === null) return;
    setSaving(true);
    setFailed(false);
    const ok = await saveSetting(addCommand(name.trim(), until, value));
    setSaving(false);
    if (ok) {
      hapticNotify("success");
      onSaved();
      return;
    }
    setFailed(true);
    hapticNotify("error");
  };

  return (
    <form
      className="flex flex-col gap-4 pt-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Field label="Название">
        <input className={inputClass} value={name} maxLength={SUB_NAME_MAX} placeholder="Например, Яндекс Плюс" autoComplete="off" onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Когда закончится">
        <input className={inputClass} type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
      </Field>
      <Field label="Сколько стоит, ₽">
        <input className={inputClass} value={price} inputMode="decimal" placeholder="299" autoComplete="off" onChange={(e) => setPrice(e.target.value)} />
      </Field>
      {price !== "" && value === null && <p className="text-[14px] text-negative">Цена — число, например 299 или 149,90.</p>}
      {failed && <p className="text-[14px] text-negative">Не сохранилось, попробуй ещё раз.</p>}
      <Button type="submit" disabled={!valid || saving} className="mt-1">
        {saving ? "Сохраняю…" : "Сохранить"}
      </Button>
    </form>
  );
}

function SubDetails({ sub, now, onDeleted }: { sub: Subscription; now: Date; onDeleted(): void }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const days = daysLeft(sub, now);
  const until = parseISO(sub.until);
  const rows: [string, string][] = [
    ["Закончится", formatLongDate(until, now).replace(/, \d{2}:\d{2}$/, "")],
    ["Осталось", days < 0 ? "уже закончилась" : days === 0 ? "последний день" : `${days} ${plural(days, ["день", "дня", "дней"])}`],
    ["Стоимость", formatPrice(sub.price)],
  ];

  const remove = async () => {
    setBusy(true);
    setFailed(false);
    const ok = await saveSetting(deleteCommand(sub.id));
    setBusy(false);
    if (ok) {
      hapticNotify("success");
      onDeleted();
      return;
    }
    setFailed(true);
    hapticNotify("error");
  };

  return (
    <div className="flex flex-col gap-4">
      <dl className="divide-y divide-rule rounded-2xl bg-raised">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="shrink-0 text-[15px] text-muted">{label}</dt>
            <dd className="num min-w-0 text-right text-[15px] font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {failed && <p className="text-[14px] text-negative">Не удалилось, попробуй ещё раз.</p>}
      {confirm ? (
        <div className="flex gap-3">
          <Button variant="quiet" className="flex-1" disabled={busy} onClick={() => setConfirm(false)}>
            Отмена
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => void remove()}>
            {busy ? "Удаляю…" : "Удалить"}
          </Button>
        </div>
      ) : (
        <Button variant="quiet" onClick={() => setConfirm(true)}>
          Удалить подписку
        </Button>
      )}
    </div>
  );
}

export function SubsScreen({ subs, now, onChanged }: Props) {
  const [sheet, setSheet] = useState<SheetState>(null);
  const sorted = useMemo(() => sortSubs(subs, now), [subs, now]);
  const total = subs.reduce((sum, s) => sum + s.price, 0);
  const close = useCallback(() => setSheet(null), []);

  useBackButton(sheet !== null, close);

  const done = () => {
    onChanged();
    close();
  };

  const subline = subs.length
    ? `${subs.length} ${plural(subs.length, ["подписка", "подписки", "подписок"])} на ${formatPrice(total)} · видишь только ты`
    : "Видишь только ты";

  return (
    <div>
      <ScreenTitle title="Подписки" subline={subline} />
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <div className="flex justify-center">
          <Button
            onClick={() => {
              hapticSelection();
              setSheet({ kind: "add" });
            }}
          >
            <Icon name="plus" size={20} />
            Добавить подписку
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Card>
            <p className="px-5 py-6 text-center text-[15px] leading-snug text-muted">Пока пусто. Добавь подписку: здесь будет видно, когда она закончится и сколько стоит.</p>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-rule">
              {sorted.map((sub) => {
                const days = daysLeft(sub, now);
                const tone = days < 0 ? "text-negative" : days <= 3 ? "text-warning" : "text-muted";
                return (
                  <li key={sub.id}>
                    <button
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setSheet({ kind: "sub", sub });
                      }}
                      className={`pressable flex w-full items-center gap-4 px-5 py-4 text-left ${days < 0 ? "opacity-70" : ""}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[17px] leading-snug font-semibold">{sub.name}</span>
                        <span className={`num mt-0.5 block text-[14px] ${tone}`}>{untilText(sub, now)}</span>
                      </span>
                      <span className="num shrink-0 text-[17px] font-semibold">{formatPrice(sub.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <Sheet open={sheet !== null} title={sheet?.kind === "sub" ? sheet.sub.name : "Новая подписка"} onClose={close}>
        {sheet?.kind === "add" && <AddForm onSaved={done} />}
        {sheet?.kind === "sub" && <SubDetails sub={sheet.sub} now={now} onDeleted={done} />}
      </Sheet>
    </div>
  );
}
