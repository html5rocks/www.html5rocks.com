# Copyright 2010 Google Inc.
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


import os
import logging
import time
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

import django.template

register = webapp.template.create_template_register()

class TOCNode(django.template.Node):
  def render(self, context):
    if not context.has_key('toc'):
      return ''
    toc = context['toc']
    output = ''
    level = 0
    for entry in toc:
      if entry['level'] > level:
        output += "<ul>"
      elif entry['level'] < level:
        output += "</ul></li>" * (level - entry['level'])
      else:
        output += "</li>"
      level = entry['level']
      output += "<li><a href='#%s' onclick='$.scrollTo(\"#%s\", 800, {offset: {top: -35}})'>%s</a>" % (entry['id'], entry['id'], entry['text'])

    output += "</li></ul>" * level
    return output


def do_toc(parser, token):
  return TOCNode()

register.tag('toc', do_toc)


class ProfileLink(django.template.Node):
  def __init__(self, ids):
    self.ids = ids
    self.profiles = [] #common.get_profiles()

  def render(self, context):
    names = []
    for id in self.ids:
      if id in self.profiles:
        profile = self.profiles[id]
        names.append("<a href='/profiles/#%(id)s'>%(given)s %(family)s</a> <span>%(role)s, %(company)s</span>" %
            {'id': profile['id'], 'given': profile['given_name'],
             'family': profile['family_name'], 'role': profile['unit'],
             'company': profile['org']})
    return ',<br> '.join(names)


def do_profile_links(parser, token):
  ids = token.split_contents()
  ids.pop(0)  # Remove tag name.
  return ProfileLink(ids)

register.tag('profilelinks', do_profile_links)


class ProfileLinkSimple(ProfileLink):
  def __init__(self, ids):
    ProfileLink.__init__(self, ids)

  def render(self, context):
    names = []
    for id in self.ids:
      if id in self.profiles:
        profile = self.profiles[id]
        names.append("<a href='/profiles/#%(id)s' data-id='%(id)s'>%(given)s %(family)s</a>" %
            {'id': profile['id'],
             'given': profile['given_name'],
             'family': profile['family_name']})
    return ', '.join(names)


def do_simple_profile_link(parser, token):
  ids = token.split_contents()
  ids.pop(0)  # Remove tag name.
  return ProfileLinkSimple(ids)

register.tag('simpleprofilelink', do_simple_profile_link)


class MixinAnnotation(django.template.Node):

  def __init__(self, props):
    self.prop = props[0]
    self.val = ' '.join(props[1:])
    if self.prop[-1] != ':':
      idx = self.prop.find('(')
      if idx == -1:
        self.prop += ':'
      else:
        self.prop = self.prop[0:idx]
        self.val = props[0][idx:] + ' ' + self.val
    if self.val[-1] != ';':
      self.val += ';'

  def render(self, context):
    PREFIXES = ['-webkit', '   -moz', '    -ms', '     -o']
    prefix_list = '\n'.join(
        ['%s-%s ...' % (x, self.prop) for x in PREFIXES])
    prefix_list += '\n        %s ...' % (self.prop) # Include unprefixed version.
    prefix_list = '/*Vendor prefixes required. Try Compass/SASS.*/\n' + prefix_list

    url = 'http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#including_a_mixin'

    tooltip_id = 'tooltip' + str(time.clock())

    return ('<a href="%s" id="%s" target="_blank" data-tooltip="%s" role="tooltip" '
            'aria-describedby="%s" class="noexternal tooltip">+'
            '<span class="property">%s</span> %s</a>' % (url, tooltip_id,
                                                         prefix_list, tooltip_id,
                                                         self.prop, self.val))


def do_mixin_annotation(parser, token):
  props = token.split_contents()
  props.pop(0)  # Remove tag name
  return MixinAnnotation(props)

register.tag('mixin', do_mixin_annotation)


"""
jQuery templates use constructs like:

    {{if condition}} print something{{/if}}

This, of course, completely screws up Django templates,
because Django thinks {{ and }} mean something.

Wrap {% verbatim %} and {% endverbatim %} around those
blocks of jQuery templates and this will try its best
to output the contents with no changes.
"""

class VerbatimNode(django.template.Node):

  def __init__(self, text):
    self.text = text
  
  def render(self, context):
    return self.text


@register.tag
def verbatim(parser, token):
  text = []
  while 1:
    token = parser.tokens.pop(0)
    if token.contents == 'endverbatim':
      break
    if token.token_type == django.template.TOKEN_VAR:
      text.append('{{')
    elif token.token_type == django.template.TOKEN_BLOCK:
      text.append('{%')
    text.append(token.contents)
    if token.token_type == django.template.TOKEN_VAR:
      text.append('}}')
    elif token.token_type == django.template.TOKEN_BLOCK:
      text.append('%}')

  return VerbatimNode(''.join(text))
