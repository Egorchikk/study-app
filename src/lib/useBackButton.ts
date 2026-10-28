import { useEffect, useRef } from "react";
import { features, tg } from "./telegram";

export function useBackButton(visible: boolean, onBack: () => void): void {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (!tg || !features.backButton || !visible) return;
    const button = tg.BackButton;
    const handler = () => handlerRef.current();
    button.onClick(handler);
    button.show();
    return () => {
      button.offClick(handler);
      button.hide();
    };
  }, [visible]);
}
