# Copyright 2020 Google LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import yaml
import logging
import re


def normalize_pathname(pathname):
  if not pathname:
    pathname = '/'

  # h5r has lots of "relpath", which doesn't include the leading slash. Add it for consistency.
  if not pathname.startswith('/'):
    pathname = '/' + pathname

  # Ensure trailing "/", remove trailing "index.html".
  if pathname.endswith('/index.html'):
    pathname = relpath[0:len(pathname) - len('index.html')]
  elif not pathname.endswith('/'):
    pathname += '/'

  return pathname


def build_redirect_matcher(f):
  f = file(f, 'r')
  raw = []

  single_redirect = {}
  group_redirect = {}

  for res in yaml.load_all(f):
    # Apparently YAML files can actually be separated by ---'s, so we get a whole document each
    # time here. Just parse everything together.
    for redir in res['redirects']:
      raw.append(redir)

  for each in raw:
    redirect_from = each['from']
    redirect_to = each['to']

    has_extra = '...' in redirect_from
    if not has_extra:
      single_redirect[normalize_pathname(redirect_from)] = redirect_to
      continue

    # Ensure the target is either a valid URL on its own, or starts with '/'.
    if not (redirect_to.startswith('https:') or redirect_to.startswith('http:')):
      if not redirect_to.startswith('/'):
        redirect_to = '/' + redirect_to

    if not redirect_from.endswith('/...'):
      logging.error('got redirect with invalid ...: ' + redirect_from + ' => ' + redirect_to)
      continue

    group_redirect[redirect_from[0:-3]] = redirect_to

  # Compile a prefix regexp for speed.
  escaped = [re.escape(x) for x in list(group_redirect.keys())]
  group_re = re.compile('^(%s)' % ('|'.join(escaped),))

  def _redir(relpath):
    pathname = normalize_pathname(relpath)
    if pathname in single_redirect:
      return single_redirect[pathname]

    m = group_re.match(pathname)
    if not m:
      return None
    redirect_from = m.group(1)
    if redirect_from not in group_redirect:
      return None

    redirect_to = group_redirect[redirect_from]
    target = redirect_to

    # If the target ends with "/...", append the found suffix. Otherwise just lose it.
    if target.endswith('/...'):
      suffix = pathname[len(redirect_from):]
      target = target[:-3] + suffix

    return target

  return _redir
