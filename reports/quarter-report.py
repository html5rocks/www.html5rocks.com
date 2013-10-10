import getpass
import sys
import re
import math

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
    quarter = int(math.ceil(today.date().month / 3.0))
    completed_articles = []
    late_articles = []
    due_articles = []
    
    for issue in issues:
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if due_on_re is None:
            continue

        due_on = datetime.strptime(due_on_re.group(2), "%Y-%m-%d")
        issue.due_on = due_on
        issue.quarter = int(math.ceil(issue.due_on.date().month / 3.0))

        if issue.quarter == quarter:
            due_articles.append(issue) 

    return (completed_articles, late_articles, sorted(due_articles, key=lambda a: a.due_on))

def main():
    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)

    open_issues = repo.get_issues(state="open")
    closed_issues = repo.get_issues(state="closed")

    issues = []
    [issues.append(i) for i in open_issues]
    [issues.append(i) for i in closed_issues]
    today = datetime.today()
    completed_articles, late_articles, due_articles = ParseIssues(issues)

    print "HTML5 Rocks Quarter Report for %s" % today.date()
    print "=========================================\n"

    print "Articles due this quater"    
    print "------------------------\n"

    if len(due_articles) == 0: 
        print "There are no articles due this quarter, either all is good, or something messed up!\n"
    else:
        print "|Author|Article|Delivery date|State|"
        print "|------|-------|-------------|-----|"

        for article in due_articles:
            print "|%s|[%s](%s)|%s|%s" % ((article.assignee or article.user).name, article.title, article.html_url, article.due_on.date(), article.state)


if __name__ == "__main__":
     main()
