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

"""Unit Tests for the YamlProcessor class."""

__author__ = ('mkwst@google.com (Mike West)')

import os
import unittest

from yaml_processor import YamlProcessor
from yaml_processor import YamlProcessorException

TEST_ROOT = os.path.abspath(os.path.dirname(__file__))


class TestYamlProcessor(unittest.TestCase):
  def testNonexistentArticle(self):
    path = os.path.join(TEST_ROOT, 'test_fixtures', 'yaml',
                        'does_not_exist', 'test.yaml')
    self.assertRaises(YamlProcessorException, YamlProcessor, path)

  def testSingleArticle(self):
    test = YamlProcessor(os.path.join(TEST_ROOT, 'test_fixtures', 'yaml',
                                      'single', 'test.yaml'))
    expected = ('{% blocktrans %}Article 1.{% endblocktrans %}\n'
                '{% blocktrans %}Description for article 1.{% endblocktrans %}')
    self.assertEqual(expected, test.localizable_text)

  def testTwoArticles(self):
    test = YamlProcessor(os.path.join(TEST_ROOT, 'test_fixtures', 'yaml',
                                      'double', 'test.yaml'))
    expected = (
        '{% blocktrans %}Article 1.{% endblocktrans %}\n'
        '{% blocktrans %}Description for article 1.{% endblocktrans %}\n'
        '{% blocktrans %}Article 2.{% endblocktrans %}\n'
        '{% blocktrans %}Description for article 2.{% endblocktrans %}')
    self.assertEqual(expected, test.localizable_text)


if __name__ == '__main__':
  unittest.main()
