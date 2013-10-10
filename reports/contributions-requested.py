import getpass
import sys
import re

from datetime import datetime, timedelta
from optparse import OptionParser
from github import Github
from github.Repository import Repository
from github.GithubException import GithubException

repository = "html5rocks/www.html5rocks.com"

def ParseIssues(issues, closed_issues):
    """
    Parses all the issues attached to the repository and determines the articles that are due
    and those that are overdue
    """
    today = datetime.today()
    late_articles = []
    due_articles = []
    unassigned = []
    completed_articles = []
 
    combined_issues = []
    [combined_issues.append(i) for i in issues]

    for issue in combined_issues:
        due_on_re = re.search("(due on|due):\s*(\d{4}-\d{2}-\d{2})", issue.body, flags=re.I)
        
        if due_on_re is None:
            if issue.closed_at is None:
                unassigned.append(issue)
            continue

    return (sorted(completed_articles, key=lambda a: a.due_on), sorted(late_articles, key=lambda a: a.due_on), sorted(due_articles, key=lambda a: a.due_on), unassigned)


def main():
    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)
   
    label = repo.get_label("new article")

    issues = repo.get_issues(state="open", labels = [label])
    closed_issues = repo.get_issues(state="closed", labels = [label])

    today = datetime.today()

    completed_articles, late_articles, due_articles, unassigned_articles = ParseIssues(issues, closed_issues)

    print "\n\nHTML5 Rocks Open Articles for %s" % today.date()
    print "========================================\n"

    print "We are always looking for developers and writers to help build the content for HTML5Rocks.\n"

    print "We have a huge list of content that we would love to get produced. If you have skills or experience in any of these areas and would like to write the article, please leave a comment on the article issue."


    if len(unassigned_articles) == 0:
        print "All articles have been asigned, have a cocktail!\n"
    else:
        print "|Proposer|Article|"
        print "|------|-------|"
    
    for article in unassigned_articles:
        print "|%s|[%s](%s)|" % ((article.assignee or article.user).name, article.title, article.html_url)
   
if __name__ == "__main__":
     main()
