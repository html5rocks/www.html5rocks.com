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

"""Converts a given string from Django template to HTML and back."""

__author__ = ('mkwst@google.com (Mike West)')

import re

UNTRANSLATABLE_BEGIN = r'<!--DO_NOT_TRANSLATE_BLOCK>'
UNTRANSLATABLE_END = r'</DO_NOT_TRANSLATE_BLOCK-->'

CONTENT_BEGIN = """
<!--CONTENT_BLOCK ***********************************************************-->
"""
CONTENT_END = """
<!--/END_CONTENT_BLOCK ******************************************************-->
"""


class TextProcessor(object):
  """Translates text from Django template format to l10nable HTML and back.

  Properties:
    dango: The Django template representation of the text.
    html: The HTML representation of the text.
  """

  def __init__(self, django='', html=''):
    self._django = django
    self._html = html

  @property
  def django(self):
    if not self._django:
      self._django = self.__HtmlToDjango(self._html)
    return self._django

  @property
  def html(self):
    if not self._html:
      self._html = self.__DjangoToHtml(self._django)
    return self._html

  def __DjangoToHtml(self, text):
    """Given a Django template's content, return HTML suitable for l10n.

    Args:
      text: The text to convert from Django to HTML.

    Returns:
      A string containing the newly HTMLized content.

      * Django tags like `{% tag %}` will be rendered inside an HTML comment:
        `<!--DO_NOT_TRANSLATE_BLOCK>{% tag %}</DO_NOT_TRANSLATE_BLOCK-->`.

      * `pre`, `script`, and `style` tags' content will be likewise wrapped:
        `<pre><!--DO_NOT_TRANSLATE_BLOCK>Text!</DO_NOT_TRANSLATE_BLOCK-->`.

      * The article's content will be wrapped:

        <!--CONTENT_BLOCK ***************************************************-->
        Content goes here!
        <!--END_CONTENT_BLOCK ***********************************************-->
    """
    django_tag_before = r'(?P<tag>{%.+?%})'
    django_tag_after = r'%s\g<tag>%s' % (UNTRANSLATABLE_BEGIN,
                                         UNTRANSLATABLE_END)

    open_notranslate_before = r'(?P<tag><(?:pre|script|style)[^>]*?>)'
    open_notranslate_after = r'\g<tag>%s' % UNTRANSLATABLE_BEGIN

    close_notranslate_before = r'(?P<tag></(?:pre|script|style)[^>]*?>)'
    close_notranslate_after = r'%s\g<tag>' % UNTRANSLATABLE_END

    open_content = r'{% block content %}'
    close_content = r'{% endblock %}'

    # Walk the given text line by line
    to_return = []
    in_content = False
    for line in text.splitlines(True):
      # Process Django tags
      line = re.sub(django_tag_before, django_tag_after, line)
      # Preprocess script/pre/style blocks
      line = re.sub(open_notranslate_before, open_notranslate_after, line)
      line = re.sub(close_notranslate_before, close_notranslate_after, line)
      # Preprocess content block
      if re.search(open_content, line):
        line = CONTENT_BEGIN
        in_content = True
      elif re.search(close_content, line) and in_content:
        line = CONTENT_END
        in_content = False

      to_return.append(line)

    return ''.join(to_return)

  def __HtmlToDjango(self, text):
    """Given localized HTML, return text formatted as a Django template.

    Args:
      text: The text to convert from HTML to Django.

    Returns:
      A string containing the newly Djangoized content, stripped of leading
      and trailing whitespace.

      See the documentation for `django_to_html` and imagine the inverse. :)
    """
    # Strip UNTRANSLATABLE_BEGIN and UNTRANSLATABLE_END comments.
    text = text.replace(UNTRANSLATABLE_BEGIN, '')
    text = text.replace(UNTRANSLATABLE_END, '')

    # Replace CONTENT_BEGIN with `{% block content %}` and CONTENT_END with
    # `{% endblock %}`.
    text = text.replace(CONTENT_BEGIN, '{% block content %}\n')
    text = text.replace(CONTENT_END, '{% endblock %}')

    # Return the result, stripped of leading/training whitespace.
    return text.strip()
