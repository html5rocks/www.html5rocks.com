#! /usr/bin/python
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

    title = options.title
    description = options.description or ""

    username = raw_input("Username: ")
    password = getpass.getpass() 

    g = Github(username, password)

    repo = g.get_repo(repository)
    label = repo.get_label("new article") 
    
    due_on = "due on: " + datetime.strptime(options.due_on, "%Y-%m-%d")
    description = due_on + "\n" + description  
  
    issue = repo.create_issue(title, body=description, labels=[label])

    print "Created issue: %s" % issue.url

if __name__ == "__main__":
     main()
