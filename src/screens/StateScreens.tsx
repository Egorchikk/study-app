import { BOT_USERNAME } from "../lib/config";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Mark } from "../components/Mark";
import { SkeletonRows } from "../components/Skeleton";

export function LoadingScreen() {
  return (
    <div aria-busy="true">
      <header className="px-5 pt-3 pb-4 lg:px-0 lg:pt-8">
        <h1 className="text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">Учёба</h1>
        <p className="skeleton mt-2 h-4 w-48" />
      </header>
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <Card>
          <div className="px-5 pt-4 pb-1">
            <p className="skeleton h-5 w-24" />
          </div>
          <SkeletonRows rows={3} />
        </Card>
        <Card>
          <div className="px-5 pt-4 pb-1">
            <p className="skeleton h-5 w-32" />
          </div>
          <SkeletonRows rows={4} />
        </Card>
      </div>
    </div>
  );
}

export function NoKeyScreen() {
  return (
    <div className="px-5 pt-8 lg:px-0">
      <Mark size={44} />
      <h1 className="mt-5 text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">Учёба</h1>
      <p className="mt-3 text-[16px] leading-snug">Задания, тесты, сроки и материалы из СДО, собранные ботом.</p>
      <p className="mt-2 text-[16px] leading-snug text-muted">Данные зашифрованы. Чтобы их увидеть, открой приложение из чата с {BOT_USERNAME ? `ботом @${BOT_USERNAME}` : "твоим ботом"} кнопкой «Учёба» под строкой ввода: вместе с ней приходит ключ.</p>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: string | null; onRetry(): void }) {
  const wrongKey = error === "wrong key";
  return (
    <div className="px-5 pt-8 lg:px-0">
      <Mark size={44} />
      <h1 className="mt-5 text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">Учёба</h1>
      <p className="mt-3 text-[16px] leading-snug">{wrongKey ? "Ключ не подходит к данным." : "Не удалось загрузить данные."}</p>
      <p className="mt-2 text-[16px] leading-snug text-muted">{wrongKey ? `Открой приложение заново из чата с ${BOT_USERNAME ? `ботом @${BOT_USERNAME}` : "твоим ботом"}: кнопка «Учёба» принесёт актуальный ключ.` : "Проверь связь и попробуй ещё раз. Если бот ещё ни разу не публиковал данные, подожди ближайшую проверку СДО."}</p>
      <Button className="mt-5" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
