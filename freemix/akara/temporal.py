'''

'''

# Useful resources:
# http://wiki.python.org/moin/WorkingWithTime
# http://seehuhn.de/pages/pdate

#Other tools we can use:
# http://code.google.com/p/parsedatetime/
# 

import feedparser
import datetime
from zen import dateparser, iso8601

from amara.lib.date import timezone, UTC

def mods_convention_date(d):
    #Feedparser extension to parse a date format idiosyncratic to MODS
    if len(d) == 14:
        try:
            #FIXME: converting via tuple to datetime, then back to tuple.  Wasteful.
            return datetime.datetime(int(d[0:4]), int(d[4:6]), int(d[6:8]), int(d[8:10]), int(d[10:12]), int(d[12:]), 0, UTC).timetuple() #.utctimetuple()
        except ValueError:
            return None
    return None

#
def plain_year(d):
    if len(d) == 4:
        try:
            #FIXME: converting via tuple to datetime, then back to tuple.  Wasteful.
            return datetime.datetime(int(d[0:4]), 1, 1).timetuple()
        except ValueError:
            return None
    return None

feedparser.registerDateHandler(mods_convention_date)
feedparser.registerDateHandler(plain_year)

def smart_parse_date(date):
    '''
    Accepts a string or unicode date to be parsed and returns a datetime.datetime result
    
    A very restrictive list of dates that can be parsed (i.e. some date formats not
    listed here should work):

    W3C dates, documented here:

    http://www.w3.org/TR/NOTE-datetime

    A subset of undelimited ISO-8601 dates work (as prevalent in LC MODS).

    YYYYDDMM
    YYYYDDMMhhmmss

    In general the dates have to be internationally unambiguous, Y2K-safe
    One exception is support for US convention, Y2K-safe year dates.

    MM/DD/YYYY
    '''
    date = date.strip()
    #FIXME: Yes, layers on layers.  Streamline it.
    try:
        dt = iso8601.parse_date(dateparser.to_iso8601(date))
        return dt
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception, e:
        pass
    #try:
    #    date = unicode(date, 'utf-8')
    #
    try:
        if len(date) == 4:
            try:
                return datetime.datetime(int(date), 1, 1)
            except ValueError:
                pass
        parts = date.split(u'/')
        if len(parts) == 3:
            return datetime.datetime(int(parts[2]), int(parts[0]), int(parts[1]))
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception, e:
        pass
    try:
        dt = datetime.datetime(*feedparser._parse_date(date)[:7])
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception, e:
        dt = None
    return dt

smart_parse_date.serviceid = u'http://purl.org/com/zepheira/zen/smartparsedate'
