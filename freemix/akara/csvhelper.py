#See also: http://www.doughellmann.com/PyMOTW/csv/

import sys
import csv

UNKNOWN_TEXT_IMT = 'text/unknown'

def readcsv(text):
    sniffer = csv.Sniffer()
    data = []
    #Heuristic: is this really a CSV?  Sniffer is pretty lax
    sanity_check_length = None
    try:
        dialect = csv.Sniffer().sniff(text[:1024])
        sniff_success = True
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception, e:
        sniff_success = False
    lines = text.splitlines()
    #print >> sys.stderr, lines[:2], dialect.__dict__
    if sniff_success and sniffer.has_header(lines[3]):
        reader = csv.DictReader(lines, dialect=dialect)
        for count, row in enumerate(reader):
            #print >> sys.stderr, row
            if sanity_check_length is None:
                sanity_check_length = len(row)
            elif not(row):
                continue
            elif len(row) != sanity_check_length:
                print 1, (len(row),sanity_check_length)
                data = []
                imt = UNKNOWN_TEXT_IMT
                break
            #data.append(row)
            data.append(dict(((k or '').decode('iso-8859-1'), val.decode('iso-8859-1')) for (k, val) in row.iteritems()))
            data[-1]['label'] = '_' + str(count)
            data[-1]['id'] = '_' + str(count)
        #for line in islice(text.split(dialect.lineterminator), 0, 2):
        #    if len(line.split(dialect.delimiter))
    elif sniff_success:
        reader = csv.reader(lines, dialect=dialect)
        #reader = csv.reader(text, delimiter=',', lineterminator='\n')
        for count, row in enumerate(reader):
            #print >> sys.stderr, row
            if sanity_check_length is None:
                sanity_check_length = len(row)
            elif not(row):
                continue
            elif len(row) != sanity_check_length:
                print 2, (len(row),sanity_check_length)
                data = []
                imt = UNKNOWN_TEXT_IMT
                break
            data.append(dict((u'field%i'%i, val.decode('iso-8859-1')) for (i, val) in enumerate(row)))
            data[-1]['label'] = '_' + str(count)
            data[-1]['id'] = '_' + str(count)
    return data


#
def compare_csv_dialects(a, b, attributes=[name for name in dir(csv.Dialect) if not name.startswith("_")]):
    #Pretty obvious, but nevertheless stolen from http://groups.google.com/group/comp.lang.python/browse_thread/thread/9de18eeabd38faff
    """
    >>> d = csv.Sniffer().sniff("1,2,3")
    >>> eq(d, csv.Sniffer().sniff("3,4,5"))
    True
    >>> eq(d, csv.Sniffer().sniff("'3','4','5'"))
    False
    >>> eq(d, csv.Sniffer().sniff("3;4;5"))
    False
    >>> eq(d, csv.Sniffer().sniff("3,4,' 5'"))
    True
    """
    return all(getattr(a, n, None) == getattr(b, n, None) for n in attributes)

