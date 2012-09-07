# -*- coding: utf-8 -*-
# Copyright 2012 Google Inc.
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


import webapp2
import settings


class MainHandler(webapp2.RequestHandler):
  def get(self):
    self.response.out.write('Nothing to see here.')

  def post(self):
    self.response.out.write(self.request.body)


routes = [('/echoserver', MainHandler)]
app = webapp2.WSGIApplication(routes, debug=settings.DEBUG)
