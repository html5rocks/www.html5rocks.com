#!/usr/bin/python

# Copyright 2011 Google Inc.
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

import cgi
import datetime
import getopt
import os
import re
import sys


class CommandLine(object):
  """Helper class to parse command line options."""

  def __PrintHelp(self):
    print ('python generate_template.py [--input filename] '
           '--output /workers/basic/index.html')

  def GetArgs(self):
    try:
      opts, args = getopt.getopt(sys.argv[1:], '', ['input=', 'output='])
    except getopt.error, msg:
      self.__PrintHelp()
      sys.exit(1)

    ifilename = None
    path = None

    # Process options
    for option, arg in opts:
      if option == '--input':
        ifilename = arg
      if option == '--output':
        path = arg

    if path is None:
      self.__PrintHelp()
      sys.exit(1)

    # Strip off first '/' if it's present. We'll be creating a relative path.
    if path[0] == '/':
      path = path[1:]

    parts = path.split('/')

    return {
      'input': ifilename,
      'new_dir': '%s/' % '/'.join(parts[:-1]),
      'filename': parts[-1],
      'iscasestudy': path.find('casestudies') != -1, # returns lowest idx found.
      'is_mobile': path.find('mobile') != -1
    }


class Article(object):
  """Container for a tutorial."""

  TUTORIAL = 0
  CASE_STUDY = 1
  MOBILE = 2

  def __init__(self, props):

    for k,v in props.iteritems():
      self.__setattr__(k, v)
      if k == 'title':
        self.id = self.title.lower().replace(' ', '-')

    # If we're not a case study or mobile article, article should be index.html,
    # so point to folder.
    if ((self.article_type in [self.CASE_STUDY, self.MOBILE]) and
         self.href[-1] != '/'):
      self.href += '/'

    self.profile_id = ''
    if self.fname and self.lname:
      self.profile_id = (self.fname + self.lname).lower()


class TutorialFactory(object):
  """Provides functionality for creating new tutorials."""

  TUTORIAL_DIR = os.path.dirname(__file__) + '/../content/tutorials/'
  CASESTUDY_DIR = TUTORIAL_DIR + '/casestudies/'
  MOBILE_DIR = os.path.dirname(__file__) + '/../content/mobile/'

  def __init__(self, new_dir, out_file_name, article=None, article_type=Article.TUTORIAL):
    if article_type == Article.MOBILE:
      self.new_dir = '%s%s' % (self.MOBILE_DIR, 'en/')
    else:
      self.new_dir = '%s%s%s' % (self.TUTORIAL_DIR, new_dir, 'en/')
    self.tut_index_file = open(self.TUTORIAL_DIR + 'index.html', 'r+')
    self.template_file = open(self.TUTORIAL_DIR + 'tutorial.html.template')
    try:
      os.makedirs(self.new_dir)
      print "== Created '" + self.new_dir + "'"
    except os.error, msg:
      print msg

    self.tut_file = open(self.new_dir + out_file_name, 'w')

    if article is not None:
      self.article = article

  def __del__(self):
    self.tut_index_file.close()
    self.tut_file.close()
    self.template_file

  def __Txt2HTML(self, content):
    """Converts plaintext to HTML.

    Args:
      content: str The text to convert to HTML.

    Returns:
      A str representing the HTML.
    """
    lines = cgi.escape(content).split('\n')
    for i,v in enumerate(lines):
      if i == 0:
        lines[i] = '<p>'
      elif i == len(lines) - 1:
        lines[i] = '</p>'
      elif not v.strip():
        lines[i] = '</p>\n\n<p>'

    return '\n'.join(lines)

  def __ConstructBrowserSupportHTML(self, support):
    """Contructs HTML for which browser's the article's content supports.

    Args:
      support: dict A browser:bool mapping list if a browser is supported.

    Returns:
      A str representing the constructed HTML.
    """
    browser_support = []
    for browser in ['opera', 'ie', 'safari', 'ff', 'chrome']:
      if support[browser]:
        browser_support.append('<span class="%s supported"></span>' % browser)
      else:
        browser_support.append('<span class="%s"></span>' % browser)

    return '\n'.join(browser_support)

  def __ConstructTagsHTML(self, tags, inline=True):
    """Contructs HTML for the filter tags.

    Args:
      tags: A list of tags as strings.
      inline: bool (optional) True if these tags are part of the article summary.

    Returns:
      A str representing the constructed HTML.
    """
    html = []
    for tag in tags:
      if inline:
        html.append('<span class="tag">%s</span>' % tag)
      else:
        html.append('<div class="tag">%s</div>' % tag)

    return '\n'.join(html)

  def __ConstructTutorialIndexPageHTML(self):
    """Contructs HTML for the tutorial index page.

    Returns:
      A str representing the constructed HTML.
    """
    data = {
        'title': self.article.title,
        'id': self.article.id,
        'href': self.article.href,
        'date': self.article.date.strftime("%Y-%m-%d"),
        'date_formatted': self.article.date.strftime("%B %d, %Y"),
        'tags_html': self.__ConstructTagsHTML(self.article.tags),
        'profile_id': '{% simpleprofilelink ' + self.article.profile_id  + ' %}',
        'browser_support': self.__ConstructBrowserSupportHTML(
            self.article.browser_support)
        }

    return '''
      <article class="sample">
        <h2 id="%(id)s" data-pubdate="%(date)s">
          <a href="%(href)s">%(title)s</a>
        </h2>
        <div>
          <span class="date">%(date_formatted)s &nbsp; By: %(profile_id)s</span>
          %(tags_html)s
        </div>
        <div class="summary">
          Change me.
        </div>
        <div class="footer_links">
          <span class="buttonlink">
            <a href="%(href)s">View tutorial</a> &rArr;
          </span>
          <span class="browsers">
            %(browser_support)s
          </span>
        </div>
      </article>''' % data

  def __IncludeContentFromFile(self, template_content, filename):
    """Contructs HTML for the filter tags.

    Args:
      template_content: str The HTML template to wrap around the file contents.
      filename: str A file containing text content to include.

    Returns:
      A str representing the constructed HTML.
    """
    ifile = open(filename)
    content = ifile.read()

    BEGIN_CONTENT_TOKEN = '{% block content %}'

    parts = re.split(BEGIN_CONTENT_TOKEN, template_content, maxsplit=1)
    if len(parts) > 1:
      m = re.search(BEGIN_CONTENT_TOKEN, template_content)
      if m:
        parts.insert(1, BEGIN_CONTENT_TOKEN)
        parts[2] = self.__Txt2HTML(content)
        parts.append('{% endblock %}')

    ifile.close()

    return '\n'.join(parts)

  def WriteTutorialIndexPage(self):
    """Writes the generated HTML output to the /tutorials/index.html page."""

    SAMPLE_TOKEN = '<!-- ___H5R_NEW_SAMPLE___ -->'
    FILTER_TOKEN = '<!-- ___H5R_FILTERS___ -->'

    file_content = self.tut_index_file.read()

    parts = re.split(SAMPLE_TOKEN, file_content, maxsplit=1)

    if len(parts) > 1:
      m = re.search(FILTER_TOKEN, file_content)
      if m:
        tags_html = self.__ConstructTagsHTML(self.article.tags, inline=False)
        parts[0] = parts[0][:m.end()] + '\n' + tags_html + parts[0][m.end():]

      parts.insert(1, SAMPLE_TOKEN)
      parts.insert(2, self.__ConstructTutorialIndexPageHTML())

      self.tut_index_file.seek(0)
      self.tut_index_file.write('\n'.join(parts))

  def WriteTutorialPage(self, filename=None):
    """Writes the generated article to the appropriate directory.

    Args:
      filename: str A file containing text content to include.
    """
    template = self.template_file.read()

    template = (template
        .replace('___FIRSTNAME___', self.article.fname)
        .replace('___LASTNAME___', self.article.lname)
        .replace('___EMAIL___', self.article.email)
        .replace('___PROFILEID___', self.article.profile_id)
        .replace('___ARTICLE_TITLE___', self.article.title)
        .replace('___ARTICLE_DATE___', self.article.date.strftime("%B %d, %Y"))
        .replace('___BROWSER_SUPPORT___',
            self.__ConstructBrowserSupportHTML(self.article.browser_support))
        )

    if self.article.article_type == Article.CASE_STUDY:
      template = template.replace(
          '{% extends "tutorial.html" %}',
          '{% extends "tutorial.html" %}')
    elif self.article.article_type == Article.MOBILE:
      template = template.replace(
          '{% extends "tutorial.html" %}',
          '{% extends "tutorial.html" %}')

    if filename is not None:
      print '== Including tutorial body from existing file.' 
      template = self.__IncludeContentFromFile(template, filename)

    self.tut_file.write(template)


def main():
  args = CommandLine().GetArgs()

  # Create a list of tags, stripping ws, lower-casing, and removing empties.
  tags = []
  tags = filter(None, [x.strip().replace(' ', '') for x in
                raw_input('Tags (e.g. tag1,tag2,tag3): ').lower().split(',')])

  # Contruct the correct href link for the tutorial index page to point to.
  article_type = Article.TUTORIAL
  if args['iscasestudy']:
    article_type = Article.CASE_STUDY
    href = '/tutorials/casestudies/' + args['filename']
    if not 'casestudy' in tags:
      tags.append('casestudy')
  elif args['is_mobile']:
    article_type = Article.MOBILE
    href = '/mobile/' + args['filename']
    if not 'mobile' in tags:
      tags.append('mobile')
  else:
    href = '/tutorials/' + args['new_dir']

  factory = TutorialFactory(args['new_dir'], args['filename'],
                            article_type=article_type)

  title = raw_input('Title of your article: ').strip()
  fname = raw_input('Your first name: ').strip()
  lname = raw_input('Your last name: ').strip()
  email = raw_input('Your email: ').strip()

  print 'Which browsers are supported?'
  browser_support = {}
  for browser in ['chrome', 'opera', 'ie', 'safari', 'ff']:
    browser_support[browser] = raw_input(
        ' ' + browser.upper() + ' (y/n)?: ').strip().lower() == 'y'

  factory.article = Article({
    'title': title,
    'href': href,
    'date': datetime.date.today(),
    'tags': tags,
    'browser_support': browser_support,
    'fname': fname,
    'lname': lname,
    'email': email,
    'article_type': article_type
  })

  print '== Adding article to index page.'
  factory.WriteTutorialIndexPage()

  print '== Writing out tutorial.'
  factory.WriteTutorialPage(filename=args['input'])

  print 'DONE!'

if __name__ == '__main__':
  main()

