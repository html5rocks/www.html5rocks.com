import getpass
import sys
import re
import netrc

from datetime import datetime, timedelta
from optparse import OptionParser
from github import Github
from github.Repository import Repository
from github.GithubException import GithubException

repository = "html5rocks/www.html5rocks.com"

def main():

    h5r_netrc = netrc.netrc()
    (username, account, password) = h5r_netrc.authenticators("html5rocks.com")

    g = Github(password)

    repo = g.get_repo(repository)

    open_pulls = repo.get_pulls(state="open")
    closed_pulls = repo.get_pulls(state="closed")

    today = datetime.today()

    print "Parsing Pull Requests"

    print "\n\nHTML5 Rocks Pull Request Report for %s" % today.date()
    print "================================================\n"

    print "Closed this week:"
    print "-----------------"
    for closed_pull in closed_pulls:
       created_at = closed_pull.created_at
       closed_at = closed_pull.closed_at
       if (today - closed_at).days > 7:
           break
         
       print "%s closed '%s' was due on %s" % ((closed_pull.merged_by or closed_pull.user).name, closed_pull.title, closed_at.date())

    print "\nStill open:"
    print "-----------"
  
    for open_pull in open_pulls:
       created_at = open_pull.created_at
       
       print "'%s' has been waiting for %s days" % (open_pull.title, (today - created_at).days)
   
if __name__ == "__main__":
     main()
