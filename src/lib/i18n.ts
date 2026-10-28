export type Lang = "ru" | "en";

export const LANGS: Lang[] = ["ru", "en"];

let current: Lang = "ru";

export function setLang(lang: Lang): void {
  current = lang;
}

export function getLang(): Lang {
  return current;
}

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

function many(n: number, one: string, other: string): string {
  return Math.abs(n) === 1 ? one : other;
}

const RU_MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const RU_MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const RU_WEEKDAYS_FULL = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EN_WEEKDAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const RU_PARTS: Record<string, string> = { "Посещаемость": "Посещения", "Текущий контроль": "Текущий", "Семестровый контроль": "Семестровый", "Достижения": "Достижения", "Трудовая деятельность": "Труд" };
const EN_PARTS: Record<string, string> = { "Посещаемость": "Attendance", "Текущий контроль": "Current", "Семестровый контроль": "Semester", "Достижения": "Achievements", "Трудовая деятельность": "Work" };
const EN_MATERIALS: Record<string, string> = { folder: "folder", forum: "forum", url: "link", resource: "file", page: "page", book: "book", label: "note" };

const ruDays = (n: number) => `${n} ${plural(n, ["день", "дня", "дней"])}`;
const ruBotRef = (bot: string) => (bot ? `ботом @${bot}` : "твоим ботом");
const enBotRef = (bot: string) => (bot ? `@${bot}` : "your bot");

const ru = {
  brand: "Учёба",
  decimal: ",",
  of: "из",
  close: "Закрыть",
  retry: "Повторить",
  commandTitle: "Команда боту",
  tabs: { home: "Главная", subjects: "Предметы", deadlines: "Сроки", brs: "БРС", check: "Проверка", settings: "Настройки" },
  nav: "Разделы",
  overdueBadge: (n: number) => `${n} просрочено`,
  kinds: { assign: "задание", quiz: "тест" },
  dates: {
    weekdaysShort: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
    dayMonth: (day: number, month: number) => `${day} ${RU_MONTHS_SHORT[month]}`,
    longDate: (weekday: number, day: number, month: number) => `${RU_WEEKDAYS_FULL[weekday]}, ${day} ${RU_MONTHS_GEN[month]}`,
    withYear: (text: string, year: number) => `${text} ${year}`,
    noData: "нет данных",
    today: (time: string) => `сегодня, ${time}`,
    yesterday: (time: string) => `вчера, ${time}`,
    overdueToday: "просрочено сегодня",
    overdueYesterday: "просрочено вчера",
    overdueAgo: (n: number) => `просрочено ${ruDays(n)} назад`,
    todayUntil: (time: string) => `сегодня до ${time}`,
    tomorrowUntil: (time: string) => `завтра до ${time}`,
    inDays: (n: number) => `через ${ruDays(n)}`,
  },
  status: {
    grade: (grade: string) => `оценка ${grade}`,
    submitted: "сдано",
    opens: (day: string) => `откроется ${day}`,
    noDue: "без срока",
    overdue: "просрочено",
    until: (day: string) => `до ${day}`,
  },
  groups: {
    overdue: "Просрочено",
    soon: (days: number) => (days === 1 ? "Сегодня и завтра" : `Ближайшие ${ruDays(days)}`),
    week: "На этой неделе",
    later: "Позже",
    locked: "Ещё не открылись",
    nodate: "Без срока",
  },
  finding: {
    allDone: "Всё сдано.",
    left: (n: number) => `Не сдано ${n} ${plural(n, ["работа", "работы", "работ"])}`,
    overdue: (n: number) => `${n} просрочено`,
    next: (when: string, course: string, name: string) => `Ближайший срок ${when}: ${course}, ${name}.`,
  },
  home: {
    sdo: "СДО",
    cached: " · из кэша",
    refresh: "Обновить",
    refreshLabel: "Обновить из СДО",
    failed: (stamp: string | null) => `Не удалось обновить данные${stamp ? `, показаны последние (${stamp})` : ""}.`,
    urgent: "Срочно",
    urgentLine: (overdue: number, soon: number, days: number) =>
      overdue > 0
        ? `${overdue} просрочено · ${soon} ${plural(soon, ["горит", "горят", "горят"])} ${days === 1 ? "сегодня и завтра" : `в ближайшие ${ruDays(days)}`}`
        : `просроченного нет, ${days === 1 ? "сегодня и завтра" : `ближайшие ${ruDays(days)}`}`,
    urgentEmpty: (days: number) => `Ничего не горит: все сроки дальше ${days} ${plural(days, ["дня", "дней", "дней"])}.`,
    weeks: "Две недели",
    weeksLine: (n: number) => (n > 0 ? `${n} ${plural(n, ["срок", "срока", "сроков"])} с сегодняшнего дня` : "сроков на две недели вперёд нет"),
    dayEmpty: "В этот день сдавать нечего.",
    weeksEmpty: "Две недели свободны.",
    more: (n: number) => `Ещё ${n} ${plural(n, ["срок", "срока", "сроков"])}, все сроки`,
    upload: "Загрузка в СДО",
    checkedAt: (stamp: string) => `проверка ${stamp}`,
    neverChecked: "проверка ещё не запускалась",
    checkAgain: "Проверить заново",
    report: "Отчёт проверки",
  },
  commands: {
    refresh: "Обновить из СДО",
    check: "Проверить и подгрузить",
    pending: "Всё несданное",
    "up:submit": "Загрузить и отправить",
    "up:draft": "Только черновик",
    "up:no": "Не надо",
  },
  strip: {
    label: "Сроки по дням на две недели",
    due: (n: number) => `${n} к сдаче`,
  },
  subjects: {
    count: (n: number) => `${n} ${plural(n, ["предмет", "предмета", "предметов"])}`,
    submitted: "сдано",
    noItems: "заданий нет",
    allDone: "всё сдано",
    pending: (n: number) => `${n} не сдано`,
    bar: (name: string, done: number, total: number) => `${name}: сдано ${done} из ${total}`,
    folderEmpty: "папка пуста",
    files: (n: number) => `${n} ${plural(n, ["файл", "файла", "файлов"])}`,
    openFolder: (name: string) => `Открыть папку «${name}» в СДО`,
    materialType: (_type: string, label: string) => label,
    noItemsOrQuizzes: "заданий и тестов нет",
    pendingTail: (n: number) => `, не сдано ${n}`,
    barCourse: (done: number, total: number) => `Сдано ${done} из ${total}`,
    courseLink: "Курс в СДО",
    pendingTitle: "Не сдано",
    doneTitle: "Сдано",
    materials: "Материалы",
    pendingEmpty: "По этому предмету всё сдано.",
    doneEmpty: "Сданных работ пока нет.",
    materialsEmpty: "Материалов в курсе нет.",
  },
  brs: {
    title: "БРС",
    journal: "Журнал оценок СДО",
    none: "Баллов в журнале оценок пока нет: они появятся после ближайшей проверки СДО.",
    passed: (passed: number, courses: number) =>
      `По текущей сумме уже ${passed === 1 ? "проходит" : "проходят"} ${passed} ${plural(passed, ["предмет", "предмета", "предметов"])} из ${courses}. Нажми на предмет, чтобы увидеть, из чего сложились баллы.`,
    some: (courses: number) => `Баллы есть по ${courses} ${plural(courses, ["предмету", "предметам", "предметам"])}. Нажми на предмет, чтобы увидеть, из чего они сложились.`,
    byParts: "баллы по разделам",
    missing: (names: string) => `Пока без баллов: ${names}.`,
    fromJournal: "Баллы из журнала оценок СДО",
    result: "По текущей сумме в СДО",
    other: "Другие работы",
    part: (name: string) => RU_PARTS[name] ?? name,
    kinds: { assign: "задание", quiz: "тест", manual: "выставляет преподаватель", calc: "считается автоматически", other: "элемент курса" },
  },
  deadlines: {
    allDone: "Всё сдано",
    left: (n: number) => plural(n, ["работа не сдана", "работы не сданы", "работ не сдано"]),
    overdue: "просрочено",
    empty: "Несданных заданий и тестов нет.",
  },
  check: {
    last: "Последняя проверка:",
    never: "Проверка СДО ещё не запускалась",
    hint: "Скачает новые файлы из СДО в папки предметов и соберёт очередь готовых работ из папок «К сдаче». Займёт несколько минут, ответ придёт в чат.",
    ready: "Готово к загрузке",
    noReport: "отчёта пока нет",
    reportHint: "Нажми «Проверить и подгрузить», и здесь появится отчёт: что срочно, что готово к загрузке.",
    upload: "Последняя загрузка",
    noUploads: "загрузок ещё не было",
    uploadHint: "После загрузки работ в СДО здесь будет отчёт по каждой из них.",
  },
  queue: {
    empty: (stamp: string | null) => `Очередь пуста: всё готовое уже в СДО${stamp ? ` (проверено ${stamp})` : ""}.`,
    due: (due: string) => ` · срок ${due}`,
  },
  item: {
    course: "Предмет",
    type: "Тип",
    status: "Статус",
    inSdo: "В СДО",
    grade: "Оценка",
    due: "Срок",
    opens: "Открывается",
    open: "Открыть в СДО",
    toCourse: "К предмету",
  },
  command: {
    rejected: "Telegram не принял команду из этого окна. Так бывает, когда приложение открыто не с кнопки под строкой ввода.",
    manual: (text: string) => `Отправь команду «${text}» в чат с ботом сам, или открой приложение кнопкой «Учёба» под клавиатурой.`,
    send: "Отправить в чат",
    outside: (bot: string) => `Команды работают только внутри Telegram: приложение передаёт их боту${bot ? ` @${bot}` : ""}, а бот запускает проверку на компьютере.`,
    ok: "Понятно",
  },
  state: {
    intro: "Задания, тесты, сроки и материалы из СДО, собранные ботом.",
    noKey: (bot: string) => `Данные зашифрованы. Чтобы их увидеть, открой приложение из чата с ${ruBotRef(bot)} кнопкой «Учёба» под строкой ввода: вместе с ней приходит ключ.`,
    wrongKey: "Ключ не подходит к данным.",
    failed: "Не удалось загрузить данные.",
    wrongKeyHint: (bot: string) => `Открой приложение заново из чата с ${ruBotRef(bot)}: кнопка «Учёба» принесёт актуальный ключ.`,
    failedHint: "Проверь связь и попробуй ещё раз. Если бот ещё ни разу не публиковал данные, подожди ближайшую проверку СДО.",
  },
  settings: {
    title: "Настройки",
    look: "Оформление",
    mode: "Тема",
    modes: { auto: "Авто", light: "Светлая", dark: "Тёмная" },
    modeHint: "«Авто» повторяет тему Telegram.",
    accent: "Цвет",
    accents: { pink: "Розовый", blue: "Голубой", mint: "Мятный", lilac: "Сиреневый", peach: "Персиковый" },
    textSize: "Размер текста",
    textSizes: { normal: "Обычный", large: "Крупный" },
    language: "Язык",
    languageHint: "Названия предметов, заданий и отчёты бота приходят из СДО на русском.",
    comfort: "Удобство",
    startTab: "Открывать при запуске",
    soonDays: "Сколько дней считать срочными",
    soonHint: "Сроки ближе этого попадают в «Срочно» на главной и в отдельную группу на вкладке «Сроки».",
    haptics: "Вибрация при нажатиях",
    hapticsHint: "Лёгкий отклик при переключении вкладок и командах.",
    notify: "Уведомления в чате",
    notifyHint: "Напоминания о сроках (за 3 дня, сутки, 6 или 2 часа) и время ежедневной сводки настраиваются у бота командой /settings.",
    notifyOpen: "Настроить в боте",
    courses: "Предметы",
    coursesHint: "Выключенный предмет пропадает из сроков, счётчиков и БРС. Удобно для курсов, которые не нужно отслеживать.",
    coursesEmpty: "Список предметов появится после загрузки данных.",
    shown: (shown: number, total: number) => `показано ${shown} из ${total}`,
    reset: "Сбросить настройки",
    storedCloud: "Настройки хранятся в Telegram и одинаковы на всех устройствах.",
    storedLocal: "Настройки хранятся в этом браузере.",
  },
};

export type Dict = typeof ru;

const en: Dict = {
  brand: "Study",
  decimal: ".",
  of: "of",
  close: "Close",
  retry: "Retry",
  commandTitle: "Bot command",
  tabs: { home: "Home", subjects: "Courses", deadlines: "Deadlines", brs: "Points", check: "Check", settings: "Settings" },
  nav: "Sections",
  overdueBadge: (n) => `${n} overdue`,
  kinds: { assign: "assignment", quiz: "quiz" },
  dates: {
    weekdaysShort: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    dayMonth: (day, month) => `${EN_MONTHS_SHORT[month]} ${day}`,
    longDate: (weekday, day, month) => `${EN_WEEKDAYS_FULL[weekday]}, ${EN_MONTHS[month]} ${day}`,
    withYear: (text, year) => `${text}, ${year}`,
    noData: "no data",
    today: (time) => `today, ${time}`,
    yesterday: (time) => `yesterday, ${time}`,
    overdueToday: "overdue since today",
    overdueYesterday: "overdue since yesterday",
    overdueAgo: (n) => `overdue by ${n} ${many(n, "day", "days")}`,
    todayUntil: (time) => `today by ${time}`,
    tomorrowUntil: (time) => `tomorrow by ${time}`,
    inDays: (n) => `in ${n} ${many(n, "day", "days")}`,
  },
  status: {
    grade: (grade) => `grade ${grade}`,
    submitted: "submitted",
    opens: (day) => `opens ${day}`,
    noDue: "no deadline",
    overdue: "overdue",
    until: (day) => `due ${day}`,
  },
  groups: {
    overdue: "Overdue",
    soon: (days) => (days === 1 ? "Today and tomorrow" : `Next ${days} days`),
    week: "This week",
    later: "Later",
    locked: "Not open yet",
    nodate: "No deadline",
  },
  finding: {
    allDone: "Everything is submitted.",
    left: (n) => `${n} ${many(n, "task", "tasks")} not submitted`,
    overdue: (n) => `${n} overdue`,
    next: (when, course, name) => `Next deadline ${when}: ${course}, ${name}.`,
  },
  home: {
    sdo: "LMS",
    cached: " · cached",
    refresh: "Refresh",
    refreshLabel: "Refresh from the LMS",
    failed: (stamp) => `Couldn't update the data${stamp ? `, showing the last copy (${stamp})` : ""}.`,
    urgent: "Urgent",
    urgentLine: (overdue, soon, days) =>
      overdue > 0
        ? `${overdue} overdue · ${soon} due ${days === 1 ? "today or tomorrow" : `within ${days} days`}`
        : `nothing overdue, ${days === 1 ? "today and tomorrow" : `next ${days} days`}`,
    urgentEmpty: (days) => `Nothing urgent: every deadline is more than ${days} ${many(days, "day", "days")} away.`,
    weeks: "Two weeks",
    weeksLine: (n) => (n > 0 ? `${n} ${many(n, "deadline", "deadlines")} from today` : "no deadlines in the next two weeks"),
    dayEmpty: "Nothing is due that day.",
    weeksEmpty: "The next two weeks are free.",
    more: (n) => `${n} more, see all deadlines`,
    upload: "Upload to the LMS",
    checkedAt: (stamp) => `checked ${stamp}`,
    neverChecked: "no check has run yet",
    checkAgain: "Check again",
    report: "Check report",
  },
  commands: {
    refresh: "Refresh from the LMS",
    check: "Check and fetch",
    pending: "Everything pending",
    "up:submit": "Upload and submit",
    "up:draft": "Draft only",
    "up:no": "Skip",
  },
  strip: {
    label: "Deadlines by day for two weeks",
    due: (n) => `${n} due`,
  },
  subjects: {
    count: (n) => `${n} ${many(n, "course", "courses")}`,
    submitted: "submitted",
    noItems: "no assignments",
    allDone: "all submitted",
    pending: (n) => `${n} not submitted`,
    bar: (name, done, total) => `${name}: ${done} of ${total} submitted`,
    folderEmpty: "empty folder",
    files: (n) => `${n} ${many(n, "file", "files")}`,
    openFolder: (name) => `Open the “${name}” folder in the LMS`,
    materialType: (type, label) => EN_MATERIALS[type] ?? label,
    noItemsOrQuizzes: "no assignments or quizzes",
    pendingTail: (n) => `, ${n} not submitted`,
    barCourse: (done, total) => `${done} of ${total} submitted`,
    courseLink: "Course in the LMS",
    pendingTitle: "Not submitted",
    doneTitle: "Submitted",
    materials: "Materials",
    pendingEmpty: "Everything is submitted for this course.",
    doneEmpty: "Nothing submitted yet.",
    materialsEmpty: "No materials in this course.",
  },
  brs: {
    title: "Points",
    journal: "LMS gradebook",
    none: "No points in the gradebook yet: they will appear after the next LMS check.",
    passed: (passed, courses) => `With the current totals you already pass ${passed} of ${courses} ${many(courses, "course", "courses")}. Tap a course to see where the points come from.`,
    some: (courses) => `There are points for ${courses} ${many(courses, "course", "courses")}. Tap a course to see where they come from.`,
    byParts: "points by section",
    missing: (names) => `No points yet: ${names}.`,
    fromJournal: "Points from the LMS gradebook",
    result: "Current LMS result",
    other: "Other work",
    part: (name) => EN_PARTS[name] ?? name,
    kinds: { assign: "assignment", quiz: "quiz", manual: "set by the teacher", calc: "calculated automatically", other: "course item" },
  },
  deadlines: {
    allDone: "All submitted",
    left: () => "not submitted",
    overdue: "overdue",
    empty: "No pending assignments or quizzes.",
  },
  check: {
    last: "Last check:",
    never: "The LMS check hasn't run yet",
    hint: "Downloads new LMS files into the course folders and queues finished work from the “К сдаче” folders. Takes a few minutes; the answer comes to the chat.",
    ready: "Ready to upload",
    noReport: "no report yet",
    reportHint: "Tap “Check and fetch” and the report appears here: what is urgent and what is ready to upload.",
    upload: "Last upload",
    noUploads: "no uploads yet",
    uploadHint: "After work is uploaded to the LMS, a report for each item appears here.",
  },
  queue: {
    empty: (stamp) => `The queue is empty: everything ready is already in the LMS${stamp ? ` (checked ${stamp})` : ""}.`,
    due: (due) => ` · due ${due}`,
  },
  item: {
    course: "Course",
    type: "Type",
    status: "Status",
    inSdo: "In the LMS",
    grade: "Grade",
    due: "Deadline",
    opens: "Opens",
    open: "Open in the LMS",
    toCourse: "Go to course",
  },
  command: {
    rejected: "Telegram didn't accept the command from this window. This happens when the app is opened some other way than the button under the input field.",
    manual: (text) => `Send “${text}” to the bot chat yourself, or open the app with the “Учёба” button under the keyboard.`,
    send: "Send to chat",
    outside: (bot) => `Commands only work inside Telegram: the app passes them to the bot${bot ? ` @${bot}` : ""}, and the bot runs the check on the computer.`,
    ok: "Got it",
  },
  state: {
    intro: "Assignments, quizzes, deadlines and materials from the LMS, collected by the bot.",
    noKey: (bot) => `The data is encrypted. To see it, open the app from the chat with ${enBotRef(bot)} using the “Учёба” button under the input field: it brings the key.`,
    wrongKey: "The key doesn't match the data.",
    failed: "Couldn't load the data.",
    wrongKeyHint: (bot) => `Reopen the app from the chat with ${enBotRef(bot)}: the “Учёба” button brings the current key.`,
    failedHint: "Check your connection and try again. If the bot hasn't published any data yet, wait for the next LMS check.",
  },
  settings: {
    title: "Settings",
    look: "Appearance",
    mode: "Theme",
    modes: { auto: "Auto", light: "Light", dark: "Dark" },
    modeHint: "“Auto” follows the Telegram theme.",
    accent: "Color",
    accents: { pink: "Pink", blue: "Blue", mint: "Mint", lilac: "Lilac", peach: "Peach" },
    textSize: "Text size",
    textSizes: { normal: "Normal", large: "Large" },
    language: "Language",
    languageHint: "Course and assignment names and the bot's reports come from the LMS in Russian.",
    comfort: "Convenience",
    startTab: "Open on launch",
    soonDays: "Days that count as urgent",
    soonHint: "Closer deadlines go to “Urgent” on the home screen and get their own group in Deadlines.",
    haptics: "Haptic feedback",
    hapticsHint: "A light tap when switching tabs and sending commands.",
    notify: "Chat notifications",
    notifyHint: "Deadline reminders (3 days, a day, 6 or 2 hours before) and the daily summary time are set in the bot with /settings.",
    notifyOpen: "Set up in the bot",
    courses: "Courses",
    coursesHint: "A course that is turned off disappears from deadlines, counters and points. Handy for courses you don't need to track.",
    coursesEmpty: "The course list appears once the data has loaded.",
    shown: (shown, total) => `${shown} of ${total} shown`,
    reset: "Reset settings",
    storedCloud: "Settings are stored in Telegram and are the same on all your devices.",
    storedLocal: "Settings are stored in this browser.",
  },
};

const DICTS: Record<Lang, Dict> = { ru, en };

export function t(): Dict {
  return DICTS[current];
}
