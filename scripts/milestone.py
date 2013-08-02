import getpass
import sys
import re

from datetime import datetime, timedelta
from optparse import OptionParser
from github import Github
from github.Repository import Repository
from github.GithubException import GithubException

repository = "html5rocks/www.html5rocks.com"

def main():
    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)

    issues = repo.get_issues(milestone="none", state="open")

    for issue in issues:
        # Make a new milestone
        print "Checking %s" % issue.title
        
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if issue.milestone is not None:
            continue

        if due_on_re is None:
            continue
        
        due_on = datetime.strptime(due_on_re.group(2), "%Y-%m-%d")

        milestone = repo.create_milestone(issue.title, due_on=due_on)
        print "Created milestone: %s" % milestone.url
        issue.edit(milestone=milestone)
        print "Issue updated with milestone"
        

if __name__ == "__main__":
     main()
