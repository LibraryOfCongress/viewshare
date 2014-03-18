"""dateparser - convert many date and date/time stamps into ISO 8601 format

Examples:

>>> import dateparser
>>> dateparser.to_iso8601("August 22, 2009")
'2009-08-22'
>>> dateparser.to_iso8601("10 Oct 2010 AD")
'2010-10-10'
>>> dateparser.to_iso8601("1883-08-27T05:30+07:00")
'1883-08-27T05:30+07:00'
>>> dateparser.to_iso8601("11.01.2009")
'2009-11-01'
>>> dateparser.to_iso8601("11.1.2009")
>>> dateparser.to_iso8601("11.1.2009") is None
True
>>> 

Note that unparseable times return a Python None and the date notation
DD/MM/YYYY is not accepted. That syntax will always be parsed assuming
the US-style MM/DD/YYYY .

For a full list of all the supported formats, see the template
definitions or tests.

"""

# Copyright 2009-2010 by Zepheira, LLC
# This module originally written by Andrew Dalke <dalke@dalkescientific.com>,
# with enhancements by Uche Ogbuji

__all__ = ["to_iso8601"]

import re

# The general approach is to define the different date patterns
# through a set of templates. Here's a template:
#
#     "YYYY - MM - DD"
#
# This gets transformed into a regular expression like this one:
#
#  (?P<year>\d{4})-(?P<month>0[1-9]|1[012])-(?P<day>0[1-9]|[12]\d|3[01])$
#
# The regular expression patterns uses Python's named groups. If the
# pattern matches an input then the group names and values are easy to
# extract. I use the group name to figure out what the value is and
# how to parse it further.
# 
# The result of that is a tuple of the form:
#
#   year, month, day, hour, minute, second, fraction, timezone
#
# where some of the fields may be None. ('year' is never None.)
#
# The last step is to turn those fields into an ISO 8601 timestamp.

##############

# Helper function:
# Convert a list of names like ["Jan", "Feb", ...]
# into a list of regular expression patterns like
#   ["(?P<month>Jan)", "(?P<month>Feb)", ...]
# Use the "group" parameter for the named regular expression group.
def names_to_regex(group, names):
    # Reverse sort so the longest names come first.
    # For example, ["January", "Jan"].
    # This avoids first-match priority in regex matching.
    names = sorted(names, reverse=1)
    regex =  ("(?P<" + group + ">" +
              "|".join(re.escape(name) for name in names) +
              ")")
    return regex

# Helper function:
# Convert a list of names like ["Jan", "Feb", ...]
# into a dict like: {"Jan": 1, "Feb": 2, ...}
def names_to_index_table(names):
    return dict( (name, i+1) for (i, name) in enumerate(names) )

# For now only supporting English month names
MONTH_NAMES = ("January February March April May June July "
               "August September October November December").split()
MONTH_ABBR = ("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec").split()

# Used to go from "January", "Jan" or "Jan." to the month index 1.
MONTH_TABLE = names_to_index_table(MONTH_NAMES)
MONTH_TABLE.update(names_to_index_table(MONTH_ABBR))
MONTH_TABLE.update(names_to_index_table(name+"." for name in MONTH_ABBR))

# Map from a given template term to its regular expression definition
regex_patterns = {
    # Using zero-width negative lookaheads (?!) to prevent matching
    # things like only the "3" in "35".
    "DAY": r"(?P<day>0[1-9]|[12]\d?|3([01]|(?!\d))|[4-9](?!\d))",
    "DD": r"(?P<day>0[1-9]|[12]\d|3[01])", # must have two digits
    "MONTH": r"(?P<month>0[1-9]|1([012]|(?!\d))|[2-9])",
    "MM": r"(?P<month>0[1-9]|1[012])",  # must have two digits

    # The year '0' is not allowed, but filter that out later on
    "YEAR": r"(?P<year>\d{1,4})",
    "YYYY": r"(?P<year>\d{4})",
    #"YY": r"(?P<year2>\d{2})",
    # This requires 4 digits, 0000 is 1BC and
    # a leading '-' is for years before 1BC.
    "ISOYEAR": r"(?P<isoyear>-?\d{4})",

    "hh": r"(?P<hour>[01]\d|2[01234])",
    "mm": r"(?P<minute>[0-5][0-9])",
    "ss": r"(?P<second>[0-5][0-9])",
    #"ss?": r"(?P<second>[0-5][0-9])?",
    "ss.s": r"(?P<second>[0-5][0-9])(\.(?P<fraction>\d+))?",

    "TZD": r"(?P<timezone>Z|(([-+])(\d{2}):(\d{2})))",
    "TZD?": r"(?P<timezone>Z|(([-+])(\d{2}):(\d{2})))?",
        
    # This parser is unusual for supporting BCE years.
    "ERA?": r"((AD|A\.D\.|CE)|(?P<bc_era>BC|B\.C\.|BCE))?",

    # Defaults to English but it's possible to override this.
    "MONTH_NAME": names_to_regex("month_name", MONTH_TABLE),

    # A few things to make my life easier
    ".": re.escape("."),
    "-": re.escape("-"),
    ":": re.escape(":"),
    "/": re.escape("/"),
    "S*": r"\s*",
    "S+": r"\s+",
}


# A simple data class
class DatePattern(object):
    def __init__(self, pattern, month_table):
        self.pattern = pattern
        self.month_table = month_table

def template_to_pattern(template, month_table=None):
    """Convert a date/time template into a regular expression
    
    Templates are terms seperated by whitespace. If the term starts
    with "\" then the rest of the term is used for exact string
    matches. For example, "\." will match "." and only ".".

    If the term starts with a "/" then the rest of the term is a
    regular expression pattern. For example, "/." matchs any character.

    If the term is the special "MONTH_NAME" then build a regular
    expression pattern based on the keys of the month_table parameter.
    The values will be used as the month index (1-12).
     
    If the term exists in the regex_patterns dictionary then use its
    value as the regular expression pattern.

    Once each term was converted, join them together and end the
    regular expression with a '$' so the template matches to the end.
    Compile the expression and return a DatePattern .

    """
    terms = template.split()
    result = []
    for term in terms:
        if term.startswith("\\"):
            # exact string match
            regex = re.escape(term[1:])
        elif term.startswith("/"):
            # regex match
            regex = term[1:]
        elif term == "MONTH_NAME":
            if month_table:
                # Alternate month name representation
                # (Probably locale specific)
                month_names = month_table.keys()
                regex = names_to_regex("month_name", month_names)
            else:
                # Use the English months
                regex = regex_patterns[term]
                month_table = MONTH_TABLE
        else:
            regex = regex_patterns[term]
        result.append(regex)
    template_regex = "".join(result) + "$"
    pattern = re.compile(template_regex)
    #print template
    #print template_regex
    return DatePattern(pattern, month_table)


_patterns = []

# the 'regex' option is an idea, but I'm not committed to it.
def add_template(template=None, month_table=None, regex=None):
    """Add a new template to the end of the list of supported formats

    Optional 'month_table' may contain alternate month names as
    dict mapping month name to month index (1-12)
    """
    if regex is None:
        if template is None:
            raise TypeError("Must specify one of 'template' or 'regex'")
        pattern = template_to_pattern(template, month_table)
    else:
        raise NotImplemented
        if template is not None:
            raise TypeError("Must not specify both 'template' and 'regex'")
        pattern = DatePattern(re.compile(regex, re.X), month_table)
    _patterns.append(pattern)

def split_date(date):
    """Convert a semi-structured date/time to a tuple of date/time values

    The resulting tuple is:
        year, month, day, hour, minute, second, fraction, timezone

    This is an internal function
    """
    for pattern in _patterns:
        #print "Try pattern"
        m = pattern.pattern.match(date)
        if m is None:
            continue
        year = month = day = hour = minute = second = fraction = timezone = None
        is_bc = False
        for group, value in m.groupdict().items():
            #print "group", group, value
            if not value:
                continue
            if group == "year":
                year = int(value)
                if year == 0:
                    # Do not allow year 0
                    year = None
                    break
            elif group == "year2":
                value = int(value)  # XXX or use a running scale?
                if value >= 70:
                    year = 1900 + value
                else:
                    year = 2000 + value
            elif group == "isoyear":
                # This allows 0 as 1BC and -1 as 2BC
                year = int(value)
            elif group == "month":
                month = int(value)
                # Check for illegal vaules
                if not (1 <= month <= 12):
                    year = None
                    break
            elif group == "month_name":
                month = pattern.month_table[value]
            elif group == "day":
                # Even February can have 31 days
                # (I don't do additional checking)
                day = int(value)
                if not (1 <= day <= 31):
                    year = None
                    break
            elif group == "hour":
                hour = int(value)
            elif group == "minute":
                minute = int(value)
                if not (0 <= minute <= 59):
                    year = None
                    break
            elif group == "second":
                # While this part of the code allows for leap seconds,
                # the regular expression pattern does not.
                second = int(value)
                if not (0 <= second <= 60):
                    year = None
                    break
            elif group == "fraction":
                fraction = int(value)
            elif group == "timezone":
                # For now pass this through. Only the ISO parser handles
                # timezones, which by regex definition is correct.
                timezone = value
            elif group == "bc_era" and value:
                # Contain's a BC identifier. Flag that
                # to negate the year when done.
                is_bc = True

        # Obviously illegal value; try the next pattern
        if year is None:
            continue

        if is_bc:
            year = -year+1
        return year, month, day, hour, minute, second, fraction, timezone
    return None

def to_iso8601(date):
    """convert a semi-structured date/time string to ISO 8691 format

    >>> to_iso8601("August 22, 2009")
    '2009-08-22'

    If the date cannot be parsed, returns None.
    """
    fields = split_date(date)
    if fields is None:
        # No idea. Give up.
        return None
    year, month, day, hour, minute, second, fraction, timezone = fields
    if hour is None:
        # No time fields given.
        # (If you implement a time definition you MUST have 'hour's)
        iso_time = ""
    else:
        # Hours requires minutes
        assert minute is not None, "Missing 'minute' when hour is present"
        # Handle the different combinations which might be present
        if second is None:
            iso_time = "T%02d:%02d" % (hour, minute)
        else:
            if fraction is not None:
                iso_time = "T%02d:%02d:%02d.%d" % (hour, minute, second, fraction)
            else:
                iso_time = "T%02d:%02d:%02d" % (hour, minute, second)
        if timezone is not None:
            iso_time += timezone

    if year < 0:
        # Special cases for years 2BC and earlier
        # Note the 5-digit day string, which includes the leading '-'
        if day is None:
            if month is None:
                assert year is not None, "Missing year"
                # ISO represents 1BC as year 0000, 2BC as -0001, etc.
                iso_date = "%05d" % (year,)
            else:
                iso_date = "%05d-%02d" % (year, month)
        else:
            iso_date = "%05d-%02d-%02d" % (year, month, day)
    else:
        if day is None:
            if month is None:
                assert year is not None, "Missing year"
                # ISO represents 1BC as year 0000, 2BC as -0001, etc.
                iso_date = "%04d" % (year,)
            else:
                iso_date = "%04d-%02d" % (year, month)
        else:
            iso_date = "%04d-%02d-%02d" % (year, month, day)
            assert not iso_date.startswith("-2 ")

    return iso_date + iso_time

####### List of date templates along with some examples


# YYYY (1997)
# YYYY-MM (1997-07)
# YYYY-MM-DD (20003-11-16) -- this is also the w3cdtf definition
# YYYY-MM-DDThh:mmTZD (1997-07-16T19:20+01:00)
# YYYY-MM-DDThh:mm:ssTZD (1997-07-16T19:20:30+01:00)
# YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)

'''
# I'm not using this approach because it's too complicated to see that it works
add_template(regex=r"""
(?P<isoyear>-?\d{4})
(-
 (?P<month>\d{2})
 (-
  (?P<day>\d{2})
  (T
   (?P<hour>\d{2})
   :
   (?P<minute>\d{2})
   (:
     (?P<second>\d{2})
     (\.(?P<fraction>\d+))?
   )?
   (?P<timezone>Z|(([-+])(\d{2}):(\d{2})))?
  )?
 )?
)?
$
""")
'''
# The above is the same as these definitions below
# The downside is that this takes 5 tests instead of 1.
# For now I prefer clarity over possible performance
add_template(r"ISOYEAR - MM - DD \T hh \: mm \: ss.s TZD?")
add_template(r"ISOYEAR - MM - DD \T hh \: mm TZD?")
add_template(r"ISOYEAR - MM - DD")
add_template(r"ISOYEAR - MM")
add_template(r"ISOYEAR")

# 2003 November
# 2003 Nov
add_template("YYYY S* MONTH_NAME")

# November 2003
# Nov 2003
add_template("MONTH_NAME /(,\s*)? S* YYYY")

# 16 November 2003
# 16 November 2003 AD
# 16 November 2003 BC
# 16 Nov 2003 BCE
# 16 November, 2003
# 16 November, 2003 AD
# 16 November, 2003 BC
# 16 Nov, 2003 BCE
add_template(r"DAY S* MONTH_NAME S* /(,\s*)? YEAR S* ERA?")

# 16 November 2003
# 16 November 2003 AD
# 16 November 2003 BC
# 16 Nov 2003 BCE
# 16 November, 2003
# 16 November, 2003 AD
# 16 November, 2003 BC
# 16 Nov, 2003 BCE
add_template("MONTH_NAME S* DAY S* /(,\s*)? S* YEAR S* ERA?")

# 2003 November 16
# 2003 Nov 16
add_template("YYYY S* MONTH_NAME S* DAY")

# 2003-Nov-16
# 2003-November-16
add_template("YYYY - MONTH_NAME - DAY")
# 2003/Nov/16
# 2003/November/16
add_template(r"YYYY \/ MONTH_NAME \/ DAY")
# 2003.Nov.16
# 2003.November.16
add_template("YYYY . MONTH_NAME . DAY")

# 20003/11/16
add_template(r"YYYY \/ MM \/ DD")
# 20003.11.16
add_template("YYYY . MM . DD")


# 11-16-2003
add_template("MM - DD - YYYY")
# 11/16/2003
add_template(r"MM \/ DD \/ YYYY")
# 11.16.2003
add_template("MM . DD . YYYY")

#### Requires knowing how to handle Y2K issues
# # 11-16-03
# add_template("MM - DD - YY")
# # 11/16/03
# add_template(r"MM \/ DD \/ YY")
# # 11.16.03
# add_template("MM . DD . YY")

# ISO 8601 "basic" format
add_template("YYYY MM DD")
