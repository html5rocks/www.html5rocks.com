import getpass
import sys

from datetime import datetime
from optparse import OptionParser
from github import Github
from github.Repository import Repository
from github.GithubException import GithubException

repository = "html5rocks/www.html5rocks.com"

def main():
    parser = OptionParser()
    parser.add_option("-t", "--title", dest="title")
    parser.add_option("-d", "--description", dest="description")
    parser.add_option("-o", "--dueon", dest="due_on")
    parser.add_option("-u", "--owner", dest="owner")

    (options, args) = parser.parse_args()

    if options.title is None or options.title == "":
        print "Article title required"
        sys.exit(1)

    if options.due_on is None or options.due_on == "":
        print "Article delivery date is required"
        sys.exit(1)

    if options.owner is None or options.owner == "":
        print "Article owner is required"
        sys.exit(1)

    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)

    due_on = datetime.strptime(options.due_on, "%Y-%m-%d")

    try:
        milestone = r.create_milestone(options.due_on, state="open", due_on=due_on)
    except GithubException as e:
        print "A milestone has already been created for this date, no two articles can be launched on the same day"
        sys.exit(1)
 
    issue = r.create_issue(options.title, body=options.description, milestone=milestone)

    print "Created issue: %s" % issue.url

if __name__ == "__main__":
     main()
