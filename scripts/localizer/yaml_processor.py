# Copyright 2012 Google Inc. All Rights Reserved.
# -*- coding: utf-8 -*-
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

"""Extracts localizable text from HTML5Rocks' YAML tutorial list."""

__author__ = ('mkwst@google.com (Mike West)')

import codecs
import os
import yaml


class YamlProcessorException(Exception):
  pass


class YamlProcessor(object):
  """Extracts localizable text from a YAML file.

  HTML5Rocks contains a `database/tutorials.yaml` file that contains metadata for the
  site's articles. The titles and descriptions in this file need to be pulled
  out for localization when `make messages` is run.
  """

  TEMPLATE = u'{%% blocktrans %%}%s{%% endblocktrans %%}'

  def __init__(self, path):
    if not os.path.exists(path):
      raise YamlProcessorException('`%s` does not exist.' % path)
    self._path = path
    self._output = None

  @property
  def localizable_text(self):
    if self._output is None:
      self._output = []
      with codecs.open(self._path, 'r', 'UTF-8') as infile:
        data = yaml.load_all(infile)
        for article in data:
          self._output.append(self.TEMPLATE % article.get('title', ''))
          self._output.append(self.TEMPLATE % article.get('description', ''))
      self._output = '\n'.join(self._output)
    return self._output
