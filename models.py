from google.appengine.api import memcache
from google.appengine.ext import db
#from google.appengine.ext.db import djangoforms
from django import forms

import logging
import settings
import urllib2


def get_profiles(update_cache=False):
  profiles = memcache.get('%s|profiles' % (settings.MEMCACHE_KEY_PREFIX))
  if profiles is None or update_cache:
    profiles = {}
    authors = Author.all().fetch(limit=settings.MAX_FETCH_LIMIT)

    for author in authors:
      author_id = author.key().name()
      profiles[author_id] = author.to_dict()
      profiles[author_id]['id'] = author_id

    memcache.set('%s|profiles' % (settings.MEMCACHE_KEY_PREFIX), profiles)

  return profiles

def get_sorted_profiles(update_cache=False):
  return sorted(get_profiles(update_cache).values(),
                key=lambda profile:profile['family_name'])


class DictModel(db.Model):
  def to_dict(self):
    #unicode(getattr(self, p)) if p is not None else None
    return dict([(p, getattr(self, p)) for p in self.properties()])


class Author(DictModel):
  """Container for author information."""

  given_name = db.StringProperty(required=True)
  family_name = db.StringProperty(required=True)
  org = db.StringProperty(required=True)
  unit = db.StringProperty(required=True)
  city = db.StringProperty()
  state = db.StringProperty()
  country = db.StringProperty(required=True)
  geo_location = db.GeoPtProperty()
  homepage = db.LinkProperty()
  google_account = db.StringProperty()
  twitter_account = db.StringProperty()
  email = db.EmailProperty()
  lanyrd = db.BooleanProperty(default=False)


class AuthorForm(forms.Form):
  given_name = forms.CharField(required=True)
  family_name = forms.CharField(required=True)
  org = forms.CharField(required=True)
  unit = forms.CharField(required=True)
  city = forms.CharField(required=False)
  state = forms.CharField(required=False)
  country = forms.CharField(required=True)
  homepage = forms.URLField(required=False)
  google_account = forms.CharField(required=False)
  twitter_account = forms.CharField(required=False)
  email = forms.EmailField(required=False)
  lanyrd = forms.BooleanField(required=False, initial=False)

  def __init__(self, *args, **keyargs):
    super(AuthorForm, self).__init__(*args, **keyargs)

    for field, val in self.fields.iteritems():
      if val.required:
        self.fields[field].widget.attrs['required'] = 'required'


class Resource(DictModel):
  """Container for all kinds of resource."""

  title = db.StringProperty(required=True)
  subtitle = db.StringProperty(required=False)
  description = db.StringProperty()
  author = db.ReferenceProperty(Author, collection_name='author_one_set')
  second_author = db.ReferenceProperty(Author, collection_name='author_two_set')
  url = db.StringProperty()
  social_url = db.StringProperty()
  browser_support = db.StringListProperty()
  update_date = db.DateProperty()
  publication_date = db.DateProperty()
  #generic tags and html5 feature group tags('offline', 'multimedia', etc.)
  tags = db.StringListProperty()
  draft = db.BooleanProperty(default=True) # Don't publish by default.

  @classmethod
  def get_all(self, order=None, limit=None, page=None, qfilter=None, include_updates=None):

    limit = limit or settings.MAX_FETCH_LIMIT
    offset = None

    key = '%s|tutorials' % (settings.MEMCACHE_KEY_PREFIX,)

    if page:
      limit = settings.FETCH_PAGE_LIMIT
      offset = (page - 1) * limit
      key += '|page%s' % (page,)

    if order is not None:
      key += '|%s' % (order,)

    if qfilter is not None:
      key += '|%s%s' % (qfilter[0], qfilter[1])

    if include_updates is not None:
      key += '|updates'

    key += '|%s' % (str(limit),)

    results = memcache.get(key)

    if results is None:
      query = self.all()
      query.order(order)
      if qfilter is not None:
        query.filter(qfilter[0], qfilter[1])
      query.filter('draft =', False) # Never return drafts by default.
      results = query.fetch(offset=offset, limit=limit)
      print limit

      if include_updates is not None:
        results = self.include_updates(results)

      memcache.set(key, results)

    return results

  @classmethod
  def include_updates(self, results):

    from google.appengine.api import urlfetch
    from datetime import date
    from time import mktime
    import json
    import time
    import re

    # Retrieve the updates results
    url = "http://updates.html5rocks.com/json"
    result = urlfetch.fetch(url)
    if result.status_code == 200:
      updates = json.loads(result.content)

      # Append the updates to the results
      for u in updates:

        # Prevent bad updates data from causing site errors.
        try:
          publication_date = re.sub(r"\.\d*$", "", u['published'])
          updated_date = re.sub(r"\.\d*$", "", u['updated'])

          publication_time = time.strptime(publication_date, "%Y-%m-%d %H:%M:%S")

          update = Resource(title=u['title'])
          update.author = Author.get_by_key_name(u['author_id'])
          update.url = 'http://updates.html5rocks.com%s' % (u['path'])
          update.publication_date = date.fromtimestamp(mktime(publication_time))
          update.description = u['description']

          if updated_date != "None":
            updated_time = time.strptime(updated_date, "%Y-%m-%d %H:%M:%S")
            update.update_date = date.fromtimestamp(mktime(updated_time))

          results.append(update)
        except db.BadValueError, e:
          logging.error(str(e))

      # Now sort them by date
      results.sort(key=lambda update:update.publication_date, reverse=True)

    return results

  @classmethod
  def get_tutorials_by_author(self, author_id):
    tutorials_by_author = memcache.get(
        '%s|tutorials_by|%s' % (settings.MEMCACHE_KEY_PREFIX, author_id))
    if tutorials_by_author is None:
      tutorials_by_author1 = Author.get_by_key_name(author_id).author_one_set
      tutorials_by_author2 = Author.get_by_key_name(author_id).author_two_set

      tutorials_by_author = [x for x in tutorials_by_author1 if not x.draft]
      temp2 = [x for x in tutorials_by_author2 if not x.draft]
      tutorials_by_author.extend(temp2)

      # Order by published date. Latest first.
      tutorials_by_author.sort(key=lambda x: x.publication_date, reverse=True)

      memcache.set(
          '%s|tutorials_by|%s' % (settings.MEMCACHE_KEY_PREFIX, author_id),
          tutorials_by_author)

    return tutorials_by_author


class TutorialForm(forms.Form):
  import datetime

  title = forms.CharField(required=True)
  subtitle = forms.CharField(required=False)

  description = forms.CharField(
      widget=forms.Textarea(attrs={'required': 'required', 'rows': 5, 'cols': 20}),
      help_text=('Description for this resource. If tutorial, a summary of the '
                 'tutorial. <br>Can include markup.'))

  sorted_profiles = get_sorted_profiles(update_cache=True)
  author = forms.ChoiceField(choices=[(p['id'],
      '%s %s' % (p['given_name'], p['family_name'])) for p in sorted_profiles])
  second_author = author

  url = forms.CharField(label='URL',
      help_text='An abs. or relative url (e.g. /tutorials/feature/something/) - do NOT forget the trailing slash!')
  social_url = forms.CharField(label='Social URL',
      help_text='A relative URL that should be used for social widgets (G+)', required=False)

  browsers = ['Chrome', 'FF', 'Safari', 'Opera', 'IE']
  browser_support = forms.MultipleChoiceField(
      widget=forms.CheckboxSelectMultiple, choices=[(b,b) for b in browsers], required=False)

  publication_date = forms.DateField(label='Publish date',
                                     initial=datetime.date.today)
  update_date = forms.DateField(label='Updated date', required=False)#,initial=datetime.date.today)

  tags = forms.CharField(
      help_text='Comma separated list (e.g. offline, performance, demo, ...)<br>Include prefixes, e.g. "type:tutorial,class:multimedia"')

  draft = forms.BooleanField(required=False, initial=True)

  def __init__(self, *args, **keyargs):
    super(TutorialForm, self).__init__(*args, **keyargs)

    for field, val in self.fields.iteritems():
      if val.required and field != 'browser_support':
        self.fields[field].widget.attrs['required'] = 'required'


class LiveData(DictModel):
  """GDU metadata for the site."""

  gdl_page_url = db.StringProperty()
  updated = db.DateTimeProperty(auto_now=True)


class LiveForm(forms.Form):

  gdl_page_url = forms.CharField(required=False, label='GDL Page URL',
      help_text='<b>NOTE: this will put a banner across the site when set.</b><br>Ex: https://developers.google.com/live/shows/aVFdhKIDDA/')

  def __init__(self, *args, **keyargs):
    super(LiveForm, self).__init__(*args, **keyargs)
