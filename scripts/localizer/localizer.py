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

"""Implements the HTML5Rocks article localization workflow."""

__author__ = ('mkwst@google.com (Mike West)')

import codecs
import os
import re

from article import Article
from article import ArticleException
from yaml_processor import YamlProcessor


class Localizer(object):
  """Implements the HTML5Rocks article localization workflow.

  Given a root directory, Localizer looks for article files (defined as pretty
  much anything living directly under an `en` directory (which is very fragile
  and assumes we'll never have articles written first in languages other than
  English (which is probably accurate, but not something we should hard-code)))
  and converts the Django templates into HTML files that can be
  passed into a translation system (by commenting out all the Django bits).

  Localizer also goes in the other direction, converting localized HTML files
  into Django-template counterparts that can be rendered as part of HTML5Rocks.
  """

  def __init__(self, original_root=None, localized_root=None):
    """Constructs a Localizer object.

    Args:
      original_root: The directory which Localizer should scan for original
          articles.
      localized_root: The directory Localizer should scan for finished
          localizations.
    """
    self.__original_root = original_root
    self.__localized_root = localized_root
    self.__articles = None

  def __IndexEnglishArticles(self):
    """Scans the original_root directory for English articles.

    Populates `self.articles_` with a list of Article objects representing
    each.

    Returns:
        list of Article objects
    """
    self.__original_articles = []
    for root, _, files in os.walk(self.__original_root):
      for name in files:
        if not name == '.DS_Store' and re.search(r'\/en$', root):
          self.__original_articles.append(Article(os.path.dirname(root)))
    return self.__original_articles

  @property
  def articles(self):
    if self.__articles is None:
      self.__IndexEnglishArticles()
    return self.__original_articles

  def GenerateLocalizableFiles(self):
    for article in self.articles:
      if not article.completely_localized:
        try:
          article.GenerateLocalizableFile()
        except ArticleException:
          pass

  def GenerateLocalizableYaml(self, path):
    processor = YamlProcessor(path)
    with codecs.open('_%s.html' % path, 'w', 'UTF-8') as outfile:
      outfile.write(processor.localizable_text)

  def ImportLocalizedFiles(self):
    for article in self.articles:
      article.ImportLocalizedFiles()
