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

"""Generates localizable HTML from Django, and imports HTML to Django.

For historical reasons, HTML5Rocks stores articles as Django templates. This
script automates the process of creating localizable HTML documents from those
Django templates by cleverly hiding the Djangoy bits with comments. As you'd
expect, it also automates the inverse process of importing localized HTML
documents as Django templates.

For equally historical reasons, HTML5Rocks stores article metadata in a YAML
file. This script also generates a localizable HTML file out of that YAML file
so that it's picked up by the message file parser.

Usage:
  l7r.py --generate
  l7r.py --generate --yaml=database/tutorials.yaml
  l7r.py --import
"""

__author__ = ('mkwst@google.com (Mike West)')

import optparse
import os

from article import Article
from article import ArticleException
from localizer import Localizer
from yaml_processor import YamlProcessorException

if __name__ == '__main__':
  parser = optparse.OptionParser()
  parser.add_option('--generate', dest='generate_html',
                    default=False, action='store_true',
                    help=('Generate HTML from Django templated articles and '
                          'stores them in `./_unlocalized`. If `--yaml` is '
                          'also specified, then only the YAML template is '
                          'generated.'))
  parser.add_option('--import', dest='import_html',
                    default=False, action='store_true',
                    help=('Generate Django templates from localized '
                          'HTML articles in `./_localized`.'))
  parser.add_option('--yaml', dest='yaml_infile', default='',
                    help=('Generate localizable template from a specified YAML '
                          'file. Output is written to `./[filename].html`'))

  options = parser.parse_args()[0]
  if not (options.generate_html or options.import_html):
    parser.error('You must specify either `--generate` or `--import`.')

  l7r = Localizer(original_root=Article.ROOT,
                   localized_root=Article.LOCALIZED_ROOT)

  if options.generate_html and options.yaml_infile:
    try:
      l7r.GenerateLocalizableYaml(options.yaml_infile)
    except YamlProcessorException:
      parser.error('`%s` couldn\'t be read.' % options.yaml_infile)
  elif options.generate_html:
    try:
      os.mkdir(Article.UNLOCALIZED_ROOT)
    except OSError:
      pass
    l7r.GenerateLocalizableFiles()
  elif options.import_html:
    try:
      os.mkdir(Article.LOCALIZED_ROOT)
    except OSError:
      pass
    l7r.ImportLocalizedFiles()
