import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip("/") + "/"
OUT = Path(sys.argv[2])
QUERY = sys.argv[3] if len(sys.argv) > 3 else "demo=1"
OUT.mkdir(parents=True, exist_ok=True)

MOCK = """
(() => {
  const handlers = {};
  const noop = () => ({});
  const btn = { isVisible: false, onClick: noop, offClick: noop, show() { this.isVisible = true; return this; }, hide() { this.isVisible = false; return this; } };
  window.Telegram = { WebApp: {
    initData: 'query_id=&user=%7B%22id%22%3A1%7D', initDataUnsafe: { user: { id: 1, first_name: 'N' } },
    version: '8.0', platform: 'ios', colorScheme: '__SCHEME__', themeParams: {}, isExpanded: true, viewportHeight: 844,
    BackButton: btn,
    HapticFeedback: { impactOccurred: noop, notificationOccurred: noop, selectionChanged: noop },
    CloudStorage: { getItem: (k, cb) => cb(null, ''), setItem: (k, v, cb) => cb && cb(null, true), removeItem: (k, cb) => cb && cb(null, true) },
    isVersionAtLeast: () => true, ready: noop, expand: noop, close: noop, sendData: noop,
    onEvent: (e, h) => { handlers[e] = h; }, offEvent: noop, setHeaderColor: noop, setBackgroundColor: noop, setBottomBarColor: noop,
    disableVerticalSwipes: noop, openLink: noop, openTelegramLink: noop, showAlert: noop,
  } };
})();
"""


def settle(page):
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(400)


def open_app(context, width, height):
    page = context.new_page()
    page.set_viewport_size({"width": width, "height": height})
    page.goto(f"{BASE}?{QUERY}", wait_until="load")
    page.get_by_role("heading", level=1).wait_for(timeout=20000)
    page.wait_for_function("!document.querySelector('[aria-busy=true]')", timeout=20000)
    settle(page)
    return page


def go(page, label):
    page.get_by_role("navigation").get_by_role("button", name=label).click()
    settle(page)


def shoot(page, name, full=False):
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path), full_page=full)
    print(path)


def phone(browser, scheme, suffix):
    context = browser.new_context(device_scale_factor=2, reduced_motion="reduce", color_scheme=scheme, locale="ru-RU")
    context.add_init_script(MOCK.replace("__SCHEME__", scheme))
    page = open_app(context, 390, 844)
    shoot(page, f"01-home-{suffix}")
    shoot(page, f"01-home-{suffix}-full", full=True)
    go(page, "Предметы")
    shoot(page, f"02-subjects-{suffix}")
    page.get_by_role("main").get_by_role("button").first.click()
    settle(page)
    shoot(page, f"03-subject-{suffix}")
    shoot(page, f"03-subject-{suffix}-full", full=True)
    go(page, "Сроки")
    shoot(page, f"04-deadlines-{suffix}")
    go(page, "Проверка")
    shoot(page, f"05-check-{suffix}")
    go(page, "Главная")
    page.get_by_role("main").locator("li button").first.click()
    page.get_by_role("dialog").wait_for()
    page.wait_for_timeout(500)
    shoot(page, f"06-item-{suffix}")
    context.close()


def desktop(browser):
    context = browser.new_context(device_scale_factor=2, reduced_motion="reduce", color_scheme="light", locale="ru-RU")
    page = open_app(context, 1280, 800)
    shoot(page, "07-desktop-home")
    go(page, "Предметы")
    shoot(page, "08-desktop-subjects")
    context.close()


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    phone(browser, "light", "390")
    phone(browser, "dark", "dark")
    desktop(browser)
    browser.close()
