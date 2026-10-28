import { COMMAND_TEXT, openChatWith, type Command } from "../lib/actions";
import { BOT_USERNAME } from "../lib/config";
import { inTelegram } from "../lib/telegram";
import { Button } from "../components/Button";

export function CommandSheet({ command, onClose }: { command: Command; onClose(): void }) {
  return (
    <div>
      {inTelegram ? (
        <>
          <p className="text-[16px] leading-snug">Telegram не принял команду из этого окна. Так бывает, когда приложение открыто не с кнопки под строкой ввода.</p>
          <p className="mt-2 text-[16px] leading-snug text-muted">Отправь команду «{COMMAND_TEXT[command]}» в чат с ботом сам, или открой приложение кнопкой «Учёба» под клавиатурой.</p>
          <div className="mt-5 flex flex-col gap-2">
            <Button className="w-full" onClick={() => openChatWith(command)}>
              Отправить в чат
            </Button>
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[16px] leading-snug">Команды работают только внутри Telegram: приложение передаёт их боту @{BOT_USERNAME}, а бот запускает проверку на компьютере.</p>
          <div className="mt-5">
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Понятно
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
