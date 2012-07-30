import os

if 'SERVER_SOFTWARE' in os.environ:
  PROD = not os.environ['SERVER_SOFTWARE'].startswith('Development')
else:
  PROD = True

APP_VERSION = os.environ['CURRENT_VERSION_ID'].split('.')[0]

MEMCACHE_KEY_PREFIX = 'newscheme' #APP_VERSION
MAX_FETCH_LIMIT = 1000

# Users whitelisted to access certain sections the site.
WHITELISTED_USERS = [
  'chrome.devrel@gmail.com'
]