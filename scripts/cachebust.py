#!/usr/bin/python

# Copyright 2012 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
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
#

__author__ = 'ericbidelman@html5rocks.com (Eric Bidelman)'


import datetime
import re


FILE_LIST = [
  '../templates/base.html',
  '../content/slides.html',
  '../content/profiles.html',
  '../content/profiles.html',
  '../content/tutorials/index.html',
  '../content/business/index.html',
  '../content/gaming/index.html',
  '../content/features/feature.html',
]

timestamp = str(datetime.datetime.now().date())

# Cache bust .js script includes in the specified files.
for filename in FILE_LIST:
  f = open(filename)
  lines = f.readlines()
  for i, line in enumerate(lines):
    #match = re.search("{{(\s+)?__DEPLOY_TIMESTAMP__(\s+)?}}", line)
    match = re.search('\.(js")><\/script>', line)
    if match is not None:
      lines[i] = line.replace('.js"></script>', '.js?%s"></script>' % timestamp)

    match2 = re.search('\.(css")>', line)
    if match2 is not None:
      lines[i] = line.replace('.css">', '.css?%s">' % timestamp)

  out = open(filename, 'w')
  out.writelines(lines)

  out.close()
  f.close()

print 'Files cache busted!'
