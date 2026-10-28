import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { sendCommand, type Command } from "./lib/actions";
import { BOT_USERNAME } from "./lib/config";
import { t } from "./lib/i18n";
import { countPending, courseById } from "./lib/model";
import { hapticSelection, initTelegram } from "./lib/telegram";
import type { Entry } from "./lib/types";
import { useBackButton } from "./lib/useBackButton";
import { useNow } from "./lib/useNow";
import { useTheme } from "./lib/useTheme";
import { DataProvider, useData } from "./store/useData";
import { SettingsProvider, useSettings } from "./store/useSettings";
import { Sheet } from "./components/Sheet";
import { TabBar, type Tab } from "./components/TabBar";
import { BrsScreen } from "./screens/BrsScreen";
import { CheckScreen } from "./screens/CheckScreen";
import { CommandSheet } from "./screens/CommandSheet";
import { DeadlinesScreen } from "./screens/DeadlinesScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ItemSheet } from "./screens/ItemSheet";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ErrorScreen, LoadingScreen, NoKeyScreen } from "./screens/StateScreens";
import { SubjectDetailScreen, SubjectsScreen } from "./screens/SubjectsScreen";

gsap.registerPlugin(useGSAP);

type SheetState = { kind: "item"; entry: Entry } | { kind: "command"; command: Command } | null;

function Shell() {
  const data = useData();
  const { settings } = useSettings();
  const now = useNow();
  const [tab, setTab] = useState<Tab>(() => settings.startTab);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const main = useRef<HTMLElement>(null);

  useTheme(settings.mode, settings.accent, settings.textSize);

  useEffect(() => {
    initTelegram();
  }, []);

  useGSAP(
    () => {
      const el = main.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out", clearProps: "all", overwrite: true });
      });
      return () => mm.revert();
    },
    { dependencies: [tab, courseId, settingsOpen] },
  );

  const changeTab = useCallback(
    (next: Tab) => {
      if (next === tab && courseId === null && !settingsOpen) return;
      setTab(next);
      setCourseId(null);
      setSettingsOpen(false);
      hapticSelection();
      window.scrollTo({ top: 0 });
    },
    [tab, courseId, settingsOpen],
  );

  const openSettings = useCallback(() => {
    if (settingsOpen) return;
    setSheet(null);
    setSettingsOpen(true);
    hapticSelection();
    window.scrollTo({ top: 0 });
  }, [settingsOpen]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const goBack = useCallback(() => {
    if (sheet) {
      setSheet(null);
      return;
    }
    if (settingsOpen) {
      setSettingsOpen(false);
      return;
    }
    if (courseId) setCourseId(null);
  }, [sheet, settingsOpen, courseId]);

  useBackButton(sheet !== null || courseId !== null || settingsOpen, goBack);

  const runCommand = useCallback(async (command: Command) => {
    const result = await sendCommand(command);
    if (result !== "sent") setSheet({ kind: "command", command });
  }, []);

  const openEntry = useCallback((entry: Entry) => setSheet({ kind: "item", entry }), []);

  const goCourse = useCallback((id: string) => {
    setSheet(null);
    setTab("subjects");
    setCourseId(id);
    window.scrollTo({ top: 0 });
  }, []);

  const hidden = settings.hidden;
  const payload = useMemo(() => {
    const full = data.payload;
    if (!full || hidden.length === 0) return full;
    const off = new Set(hidden);
    return { ...full, courses: full.courses.filter((c) => !off.has(c.id)) };
  }, [data.payload, hidden]);
  const overdue = useMemo(() => (payload ? countPending(payload, now).overdue : 0), [payload, now]);
  const course = payload && courseId ? courseById(payload, courseId) : undefined;
  const canCheck = payload?.features?.check !== false;
  const bot = payload?.bot || BOT_USERNAME;

  let screen: React.ReactNode;
  if (settingsOpen) {
    screen = <SettingsScreen courses={data.payload?.courses ?? []} bot={bot} />;
  } else if (data.status === "loading" || (data.status !== "ready" && data.refreshing && !payload)) {
    screen = <LoadingScreen />;
  } else if (data.status === "nokey" || !payload) {
    screen = data.status === "error" ? <ErrorScreen error={data.error} onRetry={data.reload} /> : <NoKeyScreen />;
  } else if ((tab === "subjects" || tab === "brs") && course) {
    screen = <SubjectDetailScreen course={course} now={now} onOpen={openEntry} />;
  } else if (tab === "subjects") {
    screen = <SubjectsScreen payload={payload} onOpenCourse={(c) => setCourseId(c.id)} />;
  } else if (tab === "brs") {
    screen = <BrsScreen payload={payload} now={now} onOpenCourse={(c) => setCourseId(c.id)} />;
  } else if (tab === "deadlines") {
    screen = <DeadlinesScreen payload={payload} now={now} onOpen={openEntry} />;
  } else if (tab === "check" && canCheck) {
    screen = <CheckScreen payload={payload} now={now} onCommand={runCommand} />;
  } else {
    screen = (
      <HomeScreen
        payload={payload}
        now={now}
        stale={data.stale}
        error={data.error}
        refreshing={data.refreshing}
        onReload={data.reload}
        onCommand={runCommand}
        onOpen={openEntry}
        onGoDeadlines={() => changeTab("deadlines")}
        onGoCheck={() => changeTab("check")}
        onSettings={openSettings}
        canCheck={canCheck}
      />
    );
  }

  const sheetTitle = sheet?.kind === "item" ? sheet.entry.name : sheet?.kind === "command" ? t().commandTitle : "";

  return (
    <div className="min-h-dvh bg-ground pt-[var(--safe-top)] lg:mx-auto lg:flex lg:max-w-[1040px] lg:gap-8 lg:px-8 lg:pt-8">
      <TabBar
        active={settingsOpen ? null : courseId && tab !== "brs" ? "subjects" : tab === "check" && !canCheck ? "home" : tab}
        onChange={changeTab}
        overdue={overdue}
        semester={payload?.semester ?? ""}
        showCheck={canCheck}
        settingsOpen={settingsOpen}
        onSettings={openSettings}
      />
      <main ref={main} className="pb-[calc(84px+var(--safe-bottom))] lg:min-w-0 lg:flex-1 lg:pb-16">
        <Fragment key={`${settings.lang}-${settings.soonDays}`}>{screen}</Fragment>
      </main>
      <Sheet open={sheet !== null} title={sheetTitle} onClose={closeSheet}>
        {sheet?.kind === "item" && <ItemSheet entry={sheet.entry} now={now} onGoCourse={goCourse} />}
        {sheet?.kind === "command" && <CommandSheet command={sheet.command} bot={bot} onClose={closeSheet} />}
      </Sheet>
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <DataProvider>
        <Shell />
      </DataProvider>
    </SettingsProvider>
  );
}
