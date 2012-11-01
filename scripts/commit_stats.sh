#!/bin/bash
#
# Runs git shortlog over the repo for the speficied data range.
#
# Copyright 2012 Eric Bidelman <ericbidelman@html5rocks.com>

echo -n 'Start date: '
read startDate

echo -n 'End date (leave blank for current date): '
read endDate

if [ -z "$endDate" ]; then
  endDate=`date +%Y-%m-%d`
fi

git shortlog -s -n -e --since=$startDate --until=$endDate
