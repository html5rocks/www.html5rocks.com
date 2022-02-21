#!/usr/bin/python
#
# Copyright (c) 2006-2009 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""A simple server for multiple machine aquarium demo."""

import cgi
import Cookie
import os
import os.path
import sys
import re
import urlparse
import json
import socket
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from optparse import OptionParser

verbose = False
g_newData = {}  # newest data
g_allData = {}  # all data since we started
g_clients = {}  # ids of clients
g_clientsThatNeedUpdates = {}  # keys for clients the need data.

def Log(*args):
  if verbose:
    print "".join(args)


class MyHandler(BaseHTTPRequestHandler):
  def __init__(self, *args):
    BaseHTTPRequestHandler.__init__(self, *args)

  def AddToObj(self, js, obj):
    for name in js:
      value = js[name]
      if type(value) is dict:
        if not name in obj:
          obj[name] = {}
        self.AddToObj(value, obj[name])
      else:
        obj[name] = value

  def AddData(self, js):
    global g_newData
    global g_allData
    global g_clients
    global g_clientsThatNeedUpdates
    # mark all known clients as needing to be updated
    for id in g_clients:
      g_clientsThatNeedUpdates[id] = True
    # add the data to both the new data and all data
    self.AddToObj(js, g_newData)
    self.AddToObj(js, g_allData)

  def do_GET(self):
    global g_newData
    global g_allData
    global g_clients
    global g_clientsThatNeedUpdates
    Log("GET:", self.path)
    (protocol, domain, path, params, query, fragment) = urlparse.urlparse(self.path)
    kv = cgi.parse_qs(query)
    try:
      if 'cmd' in kv:
        cmd = kv['cmd'][0]
        Log("CMD:", cmd)
        if cmd == 'get':
          id = kv['id'][0]
          data = g_newData
          # if this is a new client, record it and send it all the data
          if not id in g_clients:
            g_clients[id] = True
            g_clientsThatNeedUpdates[id] = True
            data = g_allData
          if 'new' in kv:
            data = g_allData
            g_clientsThatNeedUpdates[id] = True
          self.send_response(200)
          self.send_header('Access-Control-Allow-Origin', '*')
          self.send_header('Content-type',  'application/json')
          self.end_headers()
          # if this client has not received the data yet send it.
          if id in g_clientsThatNeedUpdates:
            del g_clientsThatNeedUpdates[id]
            js = json.dumps(data)
            Log("js: ", js)
            self.wfile.write(js)
            # if there are not more clients that need data delete the data.
            if len(g_clientsThatNeedUpdates) == 0:
              g_newData = {}
          else:
            Log("send empty")
            self.wfile.write(json.dumps({}))
        else:
          self.send_error(
              500,'Error unknown cmd: %s for url %s' % (cmd, self.path))

      # serve files.
      else:
        #for header in self.headers.headers:
        #  print "header:", header
        filename = os.curdir + os.sep + path
        Log("read:", filename)
        f = open(filename, "rb") #self.path has /test.html
        #note that this potentially makes every file on your computer
        #readable by the internet
        ctype = 'text/html'
        if filename.endswith(".jpg"):
          ctype = 'image/jpeg'
        elif filename.endswith(".png"):
          ctype = 'image/png'
        elif filename.endswith(".js"):
          ctype = 'application/javascript'
        elif filename.endswith(".css"):
          ctype = 'text/css'

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', ctype)
        self.end_headers()
        self.wfile.write(f.read())
        f.close()
        return

    except IOError:
      self.send_error(500,'Error: %s' % self.path)


  def do_OPTIONS(self):
    Log("OPTIONS: start")
    self.send_error(501,'Not Implemented')
    #self.send_header('Allow', 'OPTIONS,POST')
    #self.end_headers()


  def do_POST(self):
    global g_newData
    Log("POST: start")
    ctype = self.headers.getheader('content-type')
    Log("Ctype:", ctype)
    data = self.rfile.read(int(self.headers['Content-Length']))
    Log("data:", data)
    js = json.loads(data)
    self.AddData(js)
    print "g_data:", g_newData
    self.send_response(200)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Content-type',  'application/json')
    self.end_headers()
    self.wfile.write("{\"status\":\"ok\"}")
    Log("sent post response")


def main(argv):
  global verbose

  if sys.version < '2.6':
     print 'Need at least python 2.6!!!'
     sys.exit(1)

  address = socket.gethostname()

  parser = OptionParser()
  parser.add_option(
      "-p", "--port", type="int", default=80,
      help="port to bind do. Default = 80")
  parser.add_option(
      "-a", "--address", default=address,
      help=("address to bind do. Default = %s" % address))
  parser.add_option(
      "-v", "--verbose", action="store_true", default=False,
      help="prints more output.")

  (options, args) = parser.parse_args(args=argv)
  verbose = options.verbose
 
  port = ""
  if options.port != 80:
    port = ":%d" % options.port
  msg = ("Start Browser with:" +
    'http://%s%s/aquarium/aquarium.html?settings={"net":{"id":<id>}}' %
    (options.address, port))
  print msg

  os.chdir("..")
  print "Serving from: ", os.getcwd()

  try:
    server = HTTPServer((options.address, options.port), MyHandler)
    print 'started httpserver on %s:%d...' % (options.address, options.port)
    server.serve_forever()
  except KeyboardInterrupt:
    print '^C received, shutting down server'
    server.socket.close()

if __name__ == '__main__':
  main(sys.argv[1:])

