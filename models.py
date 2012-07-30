from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.ext.db import djangoforms
from django import forms

import common

def get_profiles(update_cache=False):
  profiles = memcache.get('%s|profiles' % (common.MEMCACHE_KEY_PREFIX))
  if profiles is None or update_cache:
    profiles = {}
    authors = Author.all().fetch(limit=common.MAX_FETCH_LIMIT)

    for author in authors:
      author_id = author.key().name()
      profiles[author_id] = author.to_dict()
      profiles[author_id]['id'] = author_id

    memcache.set('%s|profiles' % (common.MEMCACHE_KEY_PREFIX), profiles)

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


class AuthorForm(djangoforms.ModelForm):
  class Meta:
    model = Author
    # exlucde geo_location field from form. Handle lat/lon separately
    exclude = ['geo_location']

  def __init__(self, *args, **keyargs):
    super(AuthorForm, self).__init__(*args, **keyargs)

    for field in self.fields:
      if (self.Meta.model.properties()[field].required):
        self.fields[field].widget.attrs['required'] = 'required'


class Resource(DictModel):
  """Container for all kinds of resource."""

  title = db.StringProperty(required=True)
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
  def get_all(self, order=None, limit=None, qfilter=None):
    limit = limit or common.MAX_FETCH_LIMIT

    key = '%s|tutorials' % (common.MEMCACHE_KEY_PREFIX,)

    if order is not None:
      key += '|%s' % (order,)

    if qfilter is not None:
      key += '|%s%s' % (qfilter[0], qfilter[1])

    key += '|%s' % (str(limit),)

    #import logging
    #logging.info(key)

    results = memcache.get(key)
    if results is None:
      query = self.all()
      query.order(order)
      if qfilter is not None:
        query.filter(qfilter[0], qfilter[1])
      query.filter('draft =', False) # Never return drafts by default.
      results = query.fetch(limit=limit)
      memcache.set(key, results)

    return results

  @classmethod
  def get_tutorials_by_author(self, author_id):
    tutorials_by_author = memcache.get(
        '%s|tutorials_by|%s' % (common.MEMCACHE_KEY_PREFIX, author_id))
    if tutorials_by_author is None:
      tutorials_by_author1 = Author.get_by_key_name(author_id).author_one_set
      tutorials_by_author2 = Author.get_by_key_name(author_id).author_two_set

      tutorials_by_author = [x for x in tutorials_by_author1 if not x.draft]
      temp2 = [x for x in tutorials_by_author2 if not x.draft]
      tutorials_by_author.extend(temp2)

      # Order by published date. Latest first.
      tutorials_by_author.sort(key=lambda x: x.publication_date, reverse=True)

      memcache.set(
          '%s|tutorials_by|%s' % (common.MEMCACHE_KEY_PREFIX, author_id),
          tutorials_by_author)

    return tutorials_by_author


class TutorialForm(djangoforms.ModelForm):
  import datetime

  class Meta:
    model = Resource
    #exclude = ['update_date']
    #fields = ['title', 'url', 'author', 'description', 'tags']

  sorted_profiles = get_sorted_profiles(update_cache=True)
  author = forms.ChoiceField(choices=[(p['id'],
      '%s %s' % (p['given_name'], p['family_name'])) for p in sorted_profiles])
  second_author = author

  browsers = ['Chrome', 'FF', 'Safari', 'Opera', 'IE']
  browser_support = forms.MultipleChoiceField(
      widget=forms.CheckboxSelectMultiple, choices=[(b,b) for b in browsers])

  tags = forms.CharField(
      help_text='Comma separated list (e.g. offline, performance, demo, ...)')
  description = forms.CharField(
      widget=forms.Textarea(attrs={'rows': 5, 'cols': 20}),
      help_text=('Description for this resource. If tutorial, a summary of the '
                 'tutorial. <br>Can include markup.'))
  publication_date = forms.DateField(label='Publish date',
                                     initial=datetime.date.today)
  update_date = forms.DateField(label='Updated date')#,initial=datetime.date.today)
  url = forms.CharField(label='URL',
      help_text='An abs. or relative url (e.g. /tutorials/feature/something)')
  social_url = forms.CharField(label='Social URL',
      help_text='A relative URL that should be used for social widgets (G+)')

  def __init__(self, *args, **keyargs):
    super(TutorialForm, self).__init__(*args, **keyargs)

    for field in self.fields:
      if self.Meta.model.properties()[field].required and field != 'browser_support':
        self.fields[field].widget.attrs['required'] = 'required'


class LiveData(db.Model):
  """GDU metadata for the site."""

  hangout_url = db.StringProperty()
  moderator_topic_id = db.StringProperty()


class LiveForm(djangoforms.ModelForm):

  #class Meta:
  #  model = LiveData

  hangout_url = forms.CharField(label='Hangout URL',
      help_text='The YouTube video ID to embed. For example: http://www.youtube.com/embed/<b>eRZ4pO0gVWw</b><br><b>NOTE: this will put a banner across the site when set.</b>')
  moderator_topic_id = forms.CharField(label='Moderator topic ID',
      help_text='This is the last part of the "t" param in the moderator URL. For example: google.com/moderator/#15/e=2015a4&t=2015a4.<b>41</b><br>If not value is specified, past topics will show')
