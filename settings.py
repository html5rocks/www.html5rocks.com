# -*- coding: utf-8 -*-
import os

# Hack to get custom tags working django 1.3 + python27.
INSTALLED_APPS = (
  'nothing',
  'customtags',
)

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

TEMPLATE_DIRS = (
  os.path.join(ROOT_DIR, ''), # templates can be anywhere in root dir.
  os.path.join(ROOT_DIR, 'content'),
  os.path.join(ROOT_DIR, 'content', 'features'),
)

# i18n Configuration
LANGUAGE_CODE = 'en'
LANGS = {
  'de': 'Deutsch',
  'en': 'English',
  'fr': 'Français',
  'es': 'Español',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'pt': 'Português (Brasil)',
  'ru': 'Pусский',
  'zh': '中文 (简体)',
  'tw': '中文（繁體）',
  'fa': 'فارسی'
}
USE_I18N = True
LOCALE_PATHS = (
  os.path.join(ROOT_DIR, 'conf', 'locale'),
)

if (os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine') or
    os.getenv('SETTINGS_MODE') == 'prod'):
  PROD = True
else:
  PROD = False

DEBUG = not PROD
TEMPLATE_DEBUG = DEBUG

# App settings #################################################################
APP_VERSION = os.environ['CURRENT_VERSION_ID'].split('.')[0]

MEMCACHE_KEY_PREFIX = 'newscheme' #APP_VERSION
MAX_FETCH_LIMIT = 1000
FETCH_PAGE_LIMIT = 20

# Users whitelisted to access certain sections the site.
WHITELISTED_USERS = [
  'chrome.devrel@gmail.com'
]
