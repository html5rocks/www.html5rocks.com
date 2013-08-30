import getpass
import sys
import re

from datetime import datetime, timedelta
from optparse import OptionParser
from github import Github
from github.Repository import Repository
from github.GithubException import GithubException

repository = "html5rocks/www.html5rocks.com"

def ParseIssues(issues):
    """
    Parses all the issues attached to the repository and determines the articles that are due
    and those that are overdue
    """
    today = datetime.today()
    
    for issue in issues:
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if due_on_re is None:
            continue

        due_on = datetime.strptime(due_on_re.group(2), "%Y-%m-%d")
        issue.due_on = due_on

        if due_on < today:
           late_articles.append(issue)

        if (due_on - today).days < 7 and (due_on - today).days >= 0:
           due_articles.append(issue) 

    return (late_articles, due_articles)

def main():
    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)

    issues = repo.get_issues(state="open")

    today = datetime.today()

    print "Parsing Issues"
    late_articles, due_articles = ParseIssues(issues)

    print "\n\nHTML5 Rocks Weekly Report for %s" % today
    print "=========================================\n"

    print "Overdue articles"
    print "----------------\n"

    for article in late_articles:
       print "%s - '%s' was due on %s" % ((article.assignee or article.user).name, article.title, article.due_on.date())

    print "\nArticles due this week"    
    print "----------------------\n"

    for article in due_articles:
       print "%s - '%s' is due on %s" % ((article.assignee or article.user).name, article.title, article.due_on.date())
   
   
if __name__ == "__main__":
     main()
