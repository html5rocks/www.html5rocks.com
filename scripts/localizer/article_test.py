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
import unittest

from article import Article
from article import ArticleException

TEST_ROOT = os.path.abspath(os.path.dirname(__file__))


class TestArticleLocales(unittest.TestCase):
  ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

  def testArticleLocalesNone(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'none'))
    self.assertEqual([], temp.locales)

  def testArticleLocalesFiles(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'files'))
    self.assertEqual([], temp.locales)

  def testArticleLocalesSingle(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'single'))
    self.assertEqual(['en'], temp.locales)

  def testArticleLocalesStatic(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'single'))
    self.assertEqual(['en'], temp.locales)

  def testArticleLocalesMultiple(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'multiple'))
    self.assertEqual(['de', 'en', 'es'], temp.locales)

  def testArticleLocalesMultipleNoIndex(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'multiple_no_index'))
    self.assertEqual(['de', 'es'], temp.locales)


class TestArticlePaths(unittest.TestCase):
  ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

  def setUp(self):
    # A little bit of monkey patching never hurt nobody.
    Article.ROOT = TEST_ROOT

  def testNonexistentPath(self):
    path = os.path.join(TEST_ROOT, 'test_fixtures', 'article_path',
                        'does_not_exist')
    self.assertRaises(ArticleException, Article, path)

  def testPath(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures', 'article_path'))
    expected = os.path.join(Article.UNLOCALIZED_ROOT,
                            Article.PATH_DELIMITER.join(
                                ['test_fixtures', 'article_path']))
    expected = '%s.html' % expected
    self.assertEqual(expected, temp.localizable_file_path)

  def testMultiple(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_path_multiple', 'path1', 'path2'))
    expected = os.path.join(Article.UNLOCALIZED_ROOT,
                            Article.PATH_DELIMITER.join(
                                ['test_fixtures', 'article_path_multiple',
                                 'path1', 'path2']))
    expected = '%s.html' % expected
    self.assertEqual(expected, temp.localizable_file_path)


class TestArticleUnlocalizedGeneration(unittest.TestCase):
  def setUp(self):
    # A little bit of monkey patching never hurt nobody.
    Article.ROOT = TEST_ROOT
    Article.UNLOCALIZED_ROOT = tempfile.mkdtemp(prefix='Unlocalized_')
    self._created_file = None

  def tearDown(self):
    if self._created_file:
      os.remove(self._created_file)
    os.removedirs(Article.UNLOCALIZED_ROOT)

  def testSimple(self):
    temp = Article(os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_locales', 'single'))
    self._created_file = temp.GenerateLocalizableFile()
    self.assertEqual(temp.localizable_file_path, self._created_file)
    self.assertTrue(os.path.exists(temp.localizable_file_path))
    self.assertTrue(os.path.isfile(temp.localizable_file_path))


class TestArticleLocalizedFiles(unittest.TestCase):
  def setUp(self):
    # A little bit of monkey patching never hurt nobody.
    Article.ROOT = os.path.join(TEST_ROOT, 'test_fixtures',
                                'article_localizations', 'article_root')
    Article.LOCALIZED_ROOT = os.path.join(Article.ROOT, '..', 'localized_root')

  def testAvailableLocalizationsNone(self):
    temp = Article(os.path.join(Article.ROOT, 'none'))
    self.assertEqual([], temp.available_localizations)
    self.assertEqual([], temp.new_localizations)

  def testAvailableLocalizationsStatic(self):
    temp = Article(os.path.join(Article.ROOT, 'none'))
    self.assertEqual([], temp.available_localizations)
    self.assertEqual([], temp.new_localizations)

  def testAvailableLocalizationsOnlyEnglish(self):
    temp = Article(os.path.join(Article.ROOT, 'only_english'))
    self.assertEqual(['en'], temp.available_localizations)
    self.assertEqual([], temp.new_localizations)

  def testAvailableLocalizationsOneNew(self):
    temp = Article(os.path.join(Article.ROOT, 'one_new'))
    self.assertEqual(['de', 'en'], temp.available_localizations)
    self.assertEqual(['de'], temp.new_localizations)


if __name__ == '__main__':
  unittest.main()
