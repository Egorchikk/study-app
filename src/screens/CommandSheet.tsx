import { COMMAND_TEXT, openChatWith, type Command } from "../lib/actions";
import { t } from "../lib/i18n";
import { inTelegram } from "../lib/telegram";
import { Button } from "../components/Button";

export function CommandSheet({ command, bot, onClose }: { command: Command; bot: string; onClose(): void }) {
  const s = t();
  return (
    <div>
      {inTelegram ? (
        <>
          <p className="text-[16px] leading-snug">{s.command.rejected}</p>
          <p className="mt-2 text-[16px] leading-snug text-muted">{s.command.manual(COMMAND_TEXT[command])}</p>
          <div className="mt-5 flex flex-col gap-2">
            {bot && (
              <Button className="w-full" onClick={() => openChatWith(command, bot)}>
                {s.command.send}
              </Button>
            )}
            <Button variant="secondary" className="w-full" onClick={onClose}>
              {s.close}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[16px] leading-snug">{s.command.outside(bot)}</p>
          <div className="mt-5">
            <Button variant="secondary" className="w-full" onClick={onClose}>
              {s.command.ok}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
