import { BOT_USERNAME } from "./config";
import { hapticImpact, openTelegramLink, tg } from "./telegram";

export type Command = "refresh" | "check" | "pending" | "up:submit" | "up:draft" | "up:no";

export const COMMAND_TEXT: Record<Command, string> = {
  refresh: "🔄 Обновить из СДО",
  check: "🔍 Проверить и подгрузить",
  pending: "📋 Всё несданное",
  "up:submit": "📤 Загрузить и отправить",
  "up:draft": "📝 Только черновик",
  "up:no": "✖️ Не загружать",
};

export type SendResult = "sent" | "unsupported" | "outside";

export function prefillLink(command: Command): string {
  return `https://t.me/${BOT_USERNAME}?text=${encodeURIComponent(COMMAND_TEXT[command])}`;
}

export function sendCommand(command: Command, waitMs = 1500): Promise<SendResult> {
  if (!tg) return Promise.resolve("outside");
  hapticImpact("medium");
  try {
    tg.sendData(command);
  } catch {
    return Promise.resolve("unsupported");
  }
  return new Promise((resolve) => setTimeout(() => resolve("unsupported"), waitMs));
}

export function openChatWith(command: Command): void {
  openTelegramLink(prefillLink(command));
}
