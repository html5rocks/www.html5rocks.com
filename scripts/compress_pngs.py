#!/usr/bin/python
#
# Copyright (C) 2011 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Runs pngcrush to compress all .png images recursively in DIRS directories."""

__author__ = 'ericbidelman@html5rocks.org (Eric Bidelman)'

import os
import stat


DIRS = ['../content', '../static']
EXT = '.png'

def GetAllPngs(dirs):
  l = []
  for d in dirs:
    files = os.walk(d)
    for root, currdir, file_list in files:
      l.extend('%s/%s' % (root, f)  for f in file_list if f.endswith(EXT))
  return l

if __name__ == '__main__':
  for path in GetAllPngs(DIRS):
    new_name = '%s.crushed' % path

    os.system('./pngcrush %s %s' % (path, new_name))
    if os.path.lexists(new_name):
      os.remove(path)
      os.rename(new_name, path)
