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

"""Unit Tests for the article l10n script."""

__author__ = ('mkwst@google.com (Mike West)')

import os
import tempfile
import shutil
import unittest

from localizer import Localizer
from article import Article
from text_processor import TextProcessor
from text_processor import UNTRANSLATABLE_BEGIN
from text_processor import UNTRANSLATABLE_END

TEST_ROOT = os.path.abspath(os.path.dirname(__file__))

class Integration(unittest.TestCase):
  def setUp(self):
    self.TEMP_ROOT = tempfile.mkdtemp(prefix='Integration_')
    Article.ROOT = os.path.join(self.TEMP_ROOT, 'article_root')
    Article.UNLOCALIZED_ROOT = os.path.join(self.TEMP_ROOT, 'unlocalized_root')
    Article.LOCALIZED_ROOT = os.path.join(self.TEMP_ROOT, 'localized_root')
    os.mkdir(Article.UNLOCALIZED_ROOT)
    os.mkdir(Article.LOCALIZED_ROOT)
    # Populate a single article.
    article_dir = os.path.join(Article.ROOT, 'article1', 'en')
    os.makedirs(article_dir)
    with open(os.path.join(article_dir, 'index.html'), 'w') as f:
      f.write("{% tag %}Example")

  def tearDown(self):
    shutil.rmtree(self.TEMP_ROOT)

  def test_new_localization_workflow(self):
    # Write a new localization.
    article_dir = os.path.join(Article.LOCALIZED_ROOT, 'de')
    os.makedirs(article_dir)
    with open(os.path.join(article_dir, 'article1.html'), 'w') as f:
      text = r'%s{%% tag %%}%sBeispiel' % (UNTRANSLATABLE_BEGIN,
                                           UNTRANSLATABLE_END)
      f.write(text)

    l7r = Localizer(original_root=Article.ROOT,
                    localized_root=Article.LOCALIZED_ROOT)

    self.assertEqual(1, len(l7r.articles))

    # Test writing localizable HTML
    l7r.GenerateLocalizableFiles()
    self.assertTrue(os.path.exists(l7r.articles[0].localizable_file_path))
    self.assertTrue(os.path.isfile(l7r.articles[0].localizable_file_path))

    # Test importataion.
    l7r.ImportLocalizedFiles()
    self.assertEqual([], l7r.articles[0].new_localizations)
    self.assertTrue(os.path.exists(l7r.articles[0].GetOriginalFilePath('en')))
    self.assertTrue(os.path.isfile(l7r.articles[0].GetOriginalFilePath('en')))
    self.assertTrue(os.path.exists(l7r.articles[0].GetOriginalFilePath('de')))
    self.assertTrue(os.path.isfile(l7r.articles[0].GetOriginalFilePath('de')))

    # Verify contents
    with open(l7r.articles[0].GetOriginalFilePath('de'), 'r') as infile:
      contents = infile.read()
      self.assertEqual("{% tag %}Beispiel", contents)


if __name__ == '__main__':
  unittest.main()
