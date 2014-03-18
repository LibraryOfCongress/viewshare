"""
A higher-level class for extracting data from an Excel File using the xlrd project.

Based on From http://gizmojo.org/code/readexcel/ , but heavily modified

Sample usage:
    python spreadsheet.py myfile.xls 
"""

import os
from itertools import tee, izip

import xlrd

EMPTY_CELL = ''

EMPTY = 1
HEADER = 2
NON_HEADER_DATA = 3

def pairwise(iterable):
    #Based on recipe at http://docs.python.org/library/itertools.html
    """
    pairwise(s) -> (s0,s1), (s1,s2), (s2, s3), ...
    pairwise([]) -> []
    pairwise([1]) -> []
    """
    a, b = tee(iterable)
    b.next()
    return izip(a, b)

class readexcel(object):
    """
    Simple OS-independent class for extracting data from an Excel File.
    
    Uses the xlrd module (version 0.5.2 or later), supporting Excel versions:
    2004, 2002, XP, 2000, 97, 95, 5, 4, 3
    
    Data is extracted via iterators that return one row at a time -- either 
    as a dict or as a list. The dict generator assumes that the worksheet is 
    in tabular format with the first "data" row containing the variable names
    and all subsequent rows containing values. 
        
    Extracted data is represented fairly logically. By default dates are 
    returned as strings in "yyyy/mm/dd" format or "yyyy/mm/dd hh:mm:ss", as 
    appropriate. However, when specifying date_as_tuple=True, dates will be 
    returned as a (Year, Month, Day, Hour, Min, Second) tuple, for usage with 
    mxDateTime or DateTime. Numbers are returned as either INT or FLOAT, 
    whichever is needed to support the data. Text, booleans, and error codes 
    are also returned as appropriate representations. Quick Example:
    
        xls = readexcel('testdata.xls')
        for sname in xls.book.sheet_names():
            for row in xls.iter_dict(sname):
                print row
    """
    def __init__(self, **kwargs):
        """ Wraps an XLRD book """
        if kwargs.has_key('filename'):
            filename = kwargs['filename']
            if not os.path.isfile(filename):
                raise ValueError, "%s is not a valid filename" % filename
        self.book = xlrd.open_workbook(**kwargs)
        self.sheet_keys = {}

    #
    def classify_row(self, sheet, i):
        """
        Apply a series of heuristics to classify the row:
        
        Is the row substantively empty?
        
        Is the row non-empty, and also not likely
        a leading title or description row, to be skipped?
        """
        values = sheet.row_values(i)
        if isinstance(values[0], basestring) and values[0].startswith('#'):
            yield EMPTY
            return # ignorable comment row
        #XXX: consider using if any(...) or if all(...)
        for v in values:
            if v != EMPTY_CELL:
                break
        else:
            yield EMPTY
            return

        for v, w in pairwise(values):
            if v != EMPTY_CELL and w != EMPTY_CELL:
                #Might be a header row: check for non-string headers
                for v in values:
                    if not isinstance(v, basestring):
                        yield NON_HEADER_DATA
                        return 
                else:
                    yield HEADER
                    return 
        return

    def _parse_row(self, sheet, row_index, date_as_tuple):
        """ Sanitize incoming excel data """
        # Data Type Codes:
        #  EMPTY 0
        #  TEXT 1 a Unicode string 
        #  NUMBER 2 float 
        #  DATE 3 float 
        #  BOOLEAN 4 int; 1 means TRUE, 0 means FALSE 
        #  ERROR 5 
        values = []
        for type, value in zip(
                sheet.row_types(row_index), sheet.row_values(row_index)):
            if type == 2:
                #Convert floats to ints, if this does not destroy information
                if value == int(value):
                    value = int(value)
            elif type == 3:
                #FIXME: return datetime object
                datetuple = xlrd.xldate_as_tuple(value, self.book.datemode)
                if date_as_tuple:
                    value = datetuple
                else:
                    # time only; no date component
                    if datetuple[0] == 0 and datetuple[1] == 0 and \
                       datetuple[2] == 0: 
                        value = "%02d:%02d:%02d" % datetuple[3:]
                    # date only; no time
                    elif datetuple[3] == 0 and datetuple[4] == 0 and \
                         datetuple[5] == 0:
                        value = "%04d/%02d/%02d" % datetuple[:3]
                    else: # full date/time
                        value = "%04d/%02d/%02dT%02d:%02d:%02d" % datetuple
            elif type == 5:
                value = xlrd.error_text_from_code[value]
            values.append(value)
        return values

    #
    def normalize_headings(self, headings):
        new_headings = []
        for j, heading in enumerate(headings):
            # replace duplicate headings with "F#".
            if not heading or heading in new_headings:
                heading = u'F%s' % (j)
            new_headings.append(heading.strip())
        return new_headings

    def iter_dict(self, sname, date_as_tuple=False):
        """ Iterator for the worksheet's rows as dicts """
        sheet = self.book.sheet_by_name(sname) # Might raise XLRDError
        # parse first row, set dict keys & first_row_index
        #keys = []
        first_row_index = None
        for i in range(sheet.nrows):
            #Search for a pattern that indicates the beginning of the "rectangular data" part of the ss
            row_stereotype = tuple(self.classify_row(sheet, i))
            if NON_HEADER_DATA in row_stereotype:
                #We have data, but no headers.  Fake all the headers
                headings = self.normalize_headings([u'']*len(sheet.row_values(i)))
                first_row_index = i
                break
            elif HEADER in row_stereotype:
                headings = self.normalize_headings(self._parse_row(sheet, i, False))
                first_row_index = i + 1
                break
            
        #print headings
        self.sheet_keys[sname] = headings
        # generate a dict per data row 
        if first_row_index is not None:
            for i in range(first_row_index, sheet.nrows):
                if EMPTY not in self.classify_row(sheet, i): 
                    yield dict(map(None, headings, 
                            self._parse_row(sheet, i, date_as_tuple)))

    def iter_list(self, sname, date_as_tuple=False):
        """ Iterator for the worksheet's rows as lists """
        sheet = self.book.sheet_by_name(sname) # XLRDError
        for i in range(sheet.nrows):
            if EMPTY not in self.classify_row(sheet, i): 
                yield self._parse_row(sheet, i, date_as_tuple)


if __name__ == "__main__":
    def main(argv):
        xls = readexcel(filename=argv[1])
        pprint.pprint(list(xls.iter_dict(xls.book.sheet_names()[0])))
        
    import sys
    import pprint
    sys.exit(main(sys.argv))

