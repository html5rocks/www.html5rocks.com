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
    quarter = int(today.date().month / 4)
    completed_articles = []
    late_articles = []
    due_articles = []
    
    for issue in issues:
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if due_on_re is None:
            continue

        due_on = datetime.strptime(due_on_re.group(2), "%Y-%m-%d")
        issue.due_on = due_on
        issue.quarter = int(issue.due_on.date().month / 4) 

        if issue.state == "closed":
           completed_articles.append(issue)
           continue

        if due_on < today and issue.quarter == quarter:
            late_articles.append(issue)

        if issue.quarter == quarter:
            due_articles.append(issue) 

    return (completed_articles, late_articles, due_articles)

def main():
    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)

    open_issues = repo.get_issues(state="open")
    closed_issues = repo.get_issues(state="closed")

    print "Parsing Issues"
    issues = []
    [issues.append(i) for i in open_issues]
    [issues.append(i) for i in closed_issues]
    today = datetime.today()
    completed_articles, late_articles, due_articles = ParseIssues(issues)

    print "\n\nHTML5 Rocks Quarter Report for %s" % today.date()
    print "========================================\n"

    print "Completed articles"
    print "------------------\n"

    for article in completed_articles:
       print "%s - '%s' was completed on %s" % ((article.assignee or article.user).name, article.title, article.closed_at.date())

    print "\nOverdue articles"
    print "----------------\n"

    for article in late_articles:
       print "%s - '%s' was due on %s" % ((article.assignee or article.user).name, article.title, article.due_on.date())

    print "\nArticles due this quater"    
    print "------------------------\n"

    for article in due_articles:
       print "%s - '%s' is due on %s" % ((article.assignee or article.user).name, article.title, article.due_on.date())
   
   
if __name__ == "__main__":
     main()
