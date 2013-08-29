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

    issues = repo.get_issues(state="open")

    late_articles = []
    due_articles = []
    
    today = datetime.today()

    for issue in issues:
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if due_on_re is None:
            continue

        due_on = datetime.strptime(due_on_re.group(2), "%Y-%m-%d")
        issue.due_on = due_on

        if due_on < today:
           late_articles.append(issue)

        if (due_on - today).days < 7 and (due_on - today) >= 0:
           due_articles.append(issue) 

    print "HTML5 Rocks Weekly Report"

    print "Late articles"

    for article in late_articles:
       print "%s - %s is due on %s" % ((article.assignee or article.user).name, article.title, article.due_on)

    print "Articles due this week"    
    for article in due_articles:
       print "%s - %s is due on %s" % ((article.assignee or article.user).name, article.title, article.due_on)
   
   
if __name__ == "__main__":
     main()
