#!/usr/bin/env python

import os
import sys


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "viewshare.settings")
    execute_from_command_line([sys.argv[0]] + sys.argv[1:])

