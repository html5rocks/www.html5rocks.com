#!/usr/bin/python

__author__ = ('api.nick@google.com (Nick Mihailovski) ',
              'ericbidelman@html5rocks.com (Eric Bidelman)')

import datetime
import getopt
import getpass
import locale
import sys
import gdata.analytics.client
import gdata.gauth

APP_NAME = 'html5rocks-AggregateAnalyticsData'
GA_ACCOUNT_ID = '15028909'  # The tracking code account id (e.g. UA-15028909-X).
GA_PROFILES = [
    'ga:30048415', # www.html5rocks.com
    'ga:47360859', # updates.html5rocks.com
    'ga:33998539', # slides.html5rocks.com
    'ga:33994391', # playground.html5rocks.com
    'ga:36061411', # studio.html5rocks.com
    'ga:32565034' # code.google.com
]

totals = {}

class CSVHelper(object):

  rows = []

  def PrintFeed(self, data_feed):
    self.rows = []
    self.PrintProfileInfo(data_feed)
    self.PrintColumnNames(data_feed)
    self.PrintBody(data_feed)
    self.SaveTotals(data_feed)
    self.PrettyPrint(self.rows)
    print

  def PrintProfileInfo(self, data_feed):
    print data_feed.data_source[0].table_name.text

  def SaveTotals(self, data_feed):
    if data_feed.entry:
      for entry in data_feed.entry:
        for dimension in entry.dimension:
          if dimension.name in totals:
            totals[dimension.name] += int(dimension.value)
          else:
            totals[dimension.name] = int(dimension.value)

        for metric in entry.metric:
          if metric.name in totals:
            totals[metric.name] += int(metric.value)
          else:
            totals[metric.name] = int(metric.value)

  def PrintColumnNames(self, data_feed):
    output = []
    if data_feed.entry:
      entry  = data_feed.entry[0]
      for dimension in entry.dimension:
        output.append(dimension.name.split(':')[1])

      for metric in entry.metric:
        output.append(metric.name.split(':')[1])

      self.rows.append('\t'.join(output))

  def PrintBody(self, data_feed):
    if not data_feed:
      print 'no data found'
    else:
      for entry in data_feed.entry:
        self.PrintEntry(entry)

  def PrintEntry(self, entry):
    row = []
    for dimension in entry.dimension:
      row.append(locale.format("%d", int(dimension.value), grouping=True))

    for metric in entry.metric:
      row.append(locale.format("%d", int(metric.value), grouping=True))

    self.rows.append('\t'.join(row))

  def PrettyPrint(self, rows):
    # find the length of the longest word and add 2
    for row in rows:
      length = max(len(w) for w in row.split('\t')) + 6

    new_data = ''
    for row in rows:
      for word in row.split('\t'):
        new_data += word.ljust(length)
      new_data += '\n'

    print new_data


class CommandLine(object):

  auth = {
      'user_name': None,
      'password': None
    }
  ids = GA_PROFILES
  query = {
      'start-date': None,
      'end-date': None,
      'dimensions': None,
      'metrics': None,
      'filters': None,
      'segment': None,
      'sort': None,
      'start-index': None,
      'max-results': None
    }

  def GetArgs(self):
    try:
      opts, args = getopt.getopt(sys.argv[1:],
          'hu:vp:vi:vs:ve:vd:vm:vf:vo:vs:vn:vm:vsi:vr',
          ['help', 'user=', 'password=',
          'ids=', 'start-date=', 'end-date=', 'dimensions=', 'metrics=',
          'filters=', 'segment=', 'sort=', 'start-index=', 'max-results='])

    except getopt.GetoptError, err:
      print str(err)
      self.PrintHelp()
      sys.exit(2)

    self.SetCommandLineOptions(opts)
    self.ValidateAndUpdateOptions()
    self.RemoveNoneInQuery()

    return {
      'auth': self.auth,
      'ids': self.ids,
      'query': self.query
    }

  def SetCommandLineOptions(self, opts):
    start_date = datetime.date.today() - datetime.timedelta(weeks=4)
    end_date = datetime.date.today()

    # Set a few defaults.
    self.query['start-date'] = str(start_date)
    self.query['end-date'] = str(end_date)
    self.query['metrics'] = 'ga:pageviews,ga:visits,ga:visitors,ga:newVisits'

    for option, value in opts:
      if option in ('-h', '--help'):
        self.PrintHelp()
        sys.exit(2)
      elif option in ('-u', '--user'):
        self.auth['user_name'] = value
      elif option in ('-p', '--pass'):
        self.auth['password'] = value
      elif option in ('-i', '--ids'):
        self.ids.append(value.split(','))
      elif option in ('-s', '--start-date'):
        self.query['start-date'] = value
      elif option in ('-e', '--end-date'):
        self.query['end-date'] = value
      elif option in ('-d', '--dimensions'):
        self.query['dimensions'] = value
      elif option in ('-m', '--metrics'):
        self.query['metrics'] = value
      elif option in ('-f', '--filters'):
        self.query['filters'] = value
      elif option in ('-s', '--segment'):
        self.query['segment'] = value
      elif option in ('-n', '--sort'):
        self.query['sort'] = value
      elif option in ('-si', '--start-index'):
        self.query['start-index'] = value
      elif option in ('-r', '--max-results'):
        self.query['max-results'] = value

  def ValidateAndUpdateOptions(self):
    invalid = False

    # Validate Query infos do validating authorization.
    if not self.ids:
      print 'A table id is required'
      invalid = True
    if not self.query['start-date']:
      print 'start-date is required'
      invalid = True
    if not self.query['end-date']:
      print 'end-date is required'
      invalid = True
    if not self.query['metrics']:
      print 'You must specify at least one metric'
      invalid = True

    if invalid:
      sys.exit(2)

    while not self.auth['user_name']:
      self.auth['user_name'] = raw_input('Enter your username: ')

    while not self.auth['password']:
      self.auth['password'] = getpass.getpass()

  def RemoveNoneInQuery(self):
    for key in self.query.keys():
      if not self.query[key]:
        del self.query[key]

  def PrintHelp(self):
    print """
Google Analytics command line interface usage:

  -h or --help:  Print this helpful message

Authorization:
  -u or --user:  (required) Set the Google Account User Name
  -p or --pass:  (required) Set the Google Account Password

Specifying query parameters:
  -i or --ids:         (required) A comma seperated list of table ids (eg -i ga:1174,ga:1178)
  -s or --start-date:  (required) start-date
  -e or --end-date:    (required) end-date
  -d or --dimensions:  dimension
  -m or --metrics:     (required) metric
  -f or --filters:     filters
  -s or --segment:     segment
  -o or --sort:        sort
  -n or --start-index: start-index
  -m or --max-results: max-results
  """


def main():
  locale.setlocale(locale.LC_ALL)

  args = CommandLine().GetArgs()

  client = gdata.analytics.client.AnalyticsClient(source=APP_NAME)
  client.client_login(args['auth']['user_name'], args['auth']['password'],
                      client.source, service=client.auth_service)
  query = gdata.analytics.client.DataFeedQuery(args['query'])

  print '========================='
  print '%s - %s' % (args['query']['start-date'], args['query']['end-date'])
  print '=========================\n'

  printer = CSVHelper()
  for table_id in args['ids']:
    query.query['ids'] = table_id
    printer.PrintFeed(client.GetDataFeed(query))

  print 'Totals:'
  for k,v in totals.items():
    print '  %s: %s' % (k[3:], locale.format("%d", v, grouping=True))

if __name__ == '__main__':
  main()

