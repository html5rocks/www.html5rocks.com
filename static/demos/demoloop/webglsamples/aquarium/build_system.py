# Copyright (c) 2006-2009 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""build system library"""

import subprocess
import os

class BuildSystem(object):
  """Implements a build system"""

  def __init__(self, verbose, force, execute = True, debug = False):
    self.verbose = verbose
    self.force = force
    self.execute = execute
    self.debug = debug

  def DebugMsg(self, msg):
    if self.debug:
      print msg

  def VerboseMsg(self, msg):
    if self.verbose:
      print msg

  def ErrorMsg(self, msg):
    print "ERROR: %s" % msg

  def MakeDestinationDirectories(self, dst_files):
    """Generates destination directories if necessary."""
    for dst in dst_files:
      path = os.path.dirname(dst);
      if (len(path) > 0) and (not os.path.exists(path)):
        self.VerboseMsg("Make Directory: " + path)
        if self.execute:
          os.makedirs(path)

  def Execute(self, args):
    """Executes a command"""
    # todo: make this prettier.
    self.VerboseMsg(args)
    if self.execute:
      if subprocess.call(args) > 0:
        raise RuntimeError('FAILED: ' + ' '.join(args))

  def ShouldBuild(self, src_files, dst_files):
    """Returns true if dest_files are order than src_files or missing."""
    if self.force:
      return True

    oldest = None
    for dst in dst_files:
      if not os.path.exists(dst):
        self.DebugMsg("Build because %s does not exist" % dst)
        return True
      modified = os.path.getmtime(dst)
      if oldest == None or modified < oldest:
        old = dst
        oldest = modified

    for src in src_files:
      modified = os.path.getmtime(src)
      if modified > oldest:
        self.DebugMsg("Build because %s is newer than %s" % (src, old))
        return True

    self.DebugMsg("%s are up to date" % ", ".join(dst_files))
    return False

  def VerifyExists(self, files):
    """Verfies that all files exist"""
    for file in files:
      if not os.path.exists(file):
        self.ErrorMsg("%s does not exist" % file)
        return False
    return True

  def ExecuteIf(self, args, src_files, dst_files):
    """Executes a command if dest_files are order than src_files or missing."""
    if self.ShouldBuild(src_files, dst_files):
      self.MakeDestinationDirectories(dst_files)
      self.Execute(args)
      if self.execute and not self.VerifyExists(dst_files):
        raise RuntimeError("FAILED: build did not create all required files")


