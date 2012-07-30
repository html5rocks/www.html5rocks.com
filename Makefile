#
#	`make messages`
#
LANGUAGES=en de fr ja pt ru zh es
MAC_DJANGO_ROOT=/Applications/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/django_1_2
LINUX_DJANGO_ROOT=/usr/local/google/google_appengine/lib/django_1_2
IMPORT_ROOT=~/git/html5/google3/blaze-genfiles/devrel/html5rocks/po_files/server/tc_dump
ifeq "$(shell uname)" "Darwin"
	DJANGO_ROOT=$(MAC_DJANGO_ROOT)
else
	DJANGO_ROOT=$(LINUX_DJANGO_ROOT)
endif

define HEREDOC

HTML5Rocks Makefile
===================

Run `make messages` to regenerate the *.po files in `conf/locale/*`, and
`make compile` to recompile the *.mo files that gettext will use to
translate strings.

We're currently generating message files for English, German, Japanese,
Portuguese, Russian, Simplified Chinese, and Spanish. For additional
languages, edit the `LANGUAGES` variable in the Makefile.

endef
export HEREDOC

define EXPORT

Export to Translation Console
=============================

Hi! I've copied the newly generated English PO file to your local checkout
of the TC directory. Assuming that went well, head over to ~/git/html5/google3
and generate a CL, then drop a line to the TC team once it lands.

If you have questions, ask mkwst@google.com. :)
endef
export EXPORT

help:
	@echo "$$HEREDOC"

yaml:
	@python ./scripts/localizer/l7r.py --generate --yaml=database/tutorials.yaml

messages: yaml
	@for locale in $(LANGUAGES) ; do \
		PYTHONPATH=$(DJANGO_ROOT) $(DJANGO_ROOT)/django/bin/django-admin.py makemessages -l $$locale ; \
	done
	@python ./scripts/localizer/l7r.py --generate
	@rm -f ./database/_tutorials.yaml.html

compile:
	@PYTHONPATH=$(DJANGO_ROOT) $(DJANGO_ROOT)/django/bin/django-admin.py compilemessages
	@python ./scripts/localizer/l7r.py --import

export: messages
	@cp ./conf/locale/en/LC_MESSAGES/django.po ~/git/html5/google3/devrel/html5rocks/po_files/django.po
	@echo "$$EXPORT"

import:
	@for locale in $(LANGUAGES) ; do \
	  [ -r $(IMPORT_ROOT)/$$locale/django.po ] && cp $(IMPORT_ROOT)/$$locale/django.po ./conf/locale/$$locale/LC_MESSAGES/django.po ; \
	done

