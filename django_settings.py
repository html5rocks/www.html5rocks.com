import os

DEBUG = False
TEMPLATE_DEBUG = DEBUG

# Hack to get templates to render in django 1.2.
INSTALLED_APPS = (
  'nothing',
)

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

TEMPLATE_DIRS = (
  os.path.join(ROOT_DIR, 'templates'),
)

# i18n Configuration
LANGUAGE_CODE = 'en'
USE_I18N = True
LOCALE_PATHS = (
  os.path.join(ROOT_DIR, 'conf', 'locale'),
)
