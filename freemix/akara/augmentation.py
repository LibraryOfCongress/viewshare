'''
Data augmentation services supplied with Zen


'''

import re

from amara.lib import U
from amara.lib.date import timezone, UTC
from amara.thirdparty import json

try:
    from akara import logger
except ImportError:
    logger = None

from freemix.akara.services import register_service, zservice
from freemix.akara.temporal import smart_parse_date
from freemix.akara.geo import geolookup, local_geonames

import time; from functools import partial; isobase = partial(time.strftime, "%Y-%m-%dT%H:%M:%S")


#def UU(obj, k): return U(obj[k]) if k in obj and obj[k] is not None and U(k).strip() else u''
def UU(obj, k):
    result = U(obj.get(k), noneok=True)
    if result is None:
        return u''
    else:
        return result.strip()

GEOCODER = None


@zservice(u'http://purl.org/com/zepheira/augmentation/location')
def augment_location(source, propertyinfo, augmented, failed):
    '''
    Sample propertyinfo
    {
        "property": "latlong",
        "enabled": True,
        "label": "Mapped place",
        "tags": ["property:type=location"],
        "composite": [
            "street_address",
            "city",
            "state",
            "zip"
        ]
    }

    A few composite examples

    >>> from zen import augmentation
    >>> from freemix.akara.geo import local_geonames
    >>> augmentation.GEOCODER = local_geonames('/Users/uche/.local/lib/akara/geonames.sqlite3')
    >>> augmentation.GEOCODER('Superior, CO')

    >>> source = [{u"id": u"_1", u"label": u"_1", u"orig": u"text, text, text"}]
    >>> propinfo = {u"enabled": True, u"property": u"latlong", u"enabled": True, u"label": "mapped result", u"tags": [u"property:type=location"], u"composite": ["place1", "place2"]}
    >>> result = []
    >>> failed = {}
    >>> augmentation.augment_location(source, propinfo, result, failed)
    >>> result
    [{u'shredded': [u'text', u'text', u'text'], u'id': u'_1', u'label': u'_1'}]

    A few non-composite examples

    >>> source = [{u"id": u"_1", u"label": u"_1", u"placename": u"Georgia"}]
    >>> propinfo = {u"enabled": True, u"property": u"latlong", u"enabled": True, u"label": "mapped result", u"tags": [u"property:type=location"], u"composite": ["placename"]}
    >>> result = []
    >>> failed = {}
    >>> augmentation.augment_location(source, propinfo, result, failed)
    >>> result
    [{u'latlong': '{"Georgia": "42,43.5"}', u'id': u'_1', u'label': u'_1'}]
    '''
    #In the above "Georgia" example, if you wanted the US state instead (83.50,32.71)
    #You need to specify heuristics for the geocoder
    #It is possible for us to get passed in a data profile which includes a property of type location which is not meant to be augmented.
    #In that case there will be no composite param
    if not u"composite" in propertyinfo:
        return
    composite = propertyinfo[u"composite"]
    pname = propertyinfo.get(u"property", u'location_latlong')
    def each_obj(obj, id):
        address_parts = [ UU(obj, k) for k in composite ]
        if not any(address_parts):
            failed.setdefault(pname, []).append({u'id': id, u'label': obj[u'label'], 'input': address_parts, 'reason': u'No address information found'})
            return
        location = u', '.join(address_parts)
        if logger: logger.debug("location input: " + repr(location))
        if GEOCODER:
            result = GEOCODER(location)
            location_latlong = result.values()[0] if result else ""
        else:
            #Use an HTTP server for the geoname
            location_latlong = geolookup(location)
        if location_latlong:
            augmented.append({u'id': id, u'label': obj[u'label'],
                                pname: location_latlong})
        else:
            failed.setdefault(pname, []).append({u'id': id, u'label': obj[u'label'], 'input': address_parts, 'reason': u'No geolocation possible for address'})
    augment_wrapper(source, pname, failed, each_obj, 'augment_location')
    return


def augment_wrapper(source, pname, failed, func, opname):
    for obj in source:
        try:
            id = obj[u'id']
            func(obj, id)
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception, e:
            if logger: logger.info('Exception in %s: '%opname + repr(e))
            failed.setdefault(pname, []).append({u'id': id, u'label': obj[u'label'], 'input': '(masked by exception)', 'reason': repr(e)})


LEN_BASE_ISOFORMAT = 19

@zservice(u'http://purl.org/com/zepheira/augmentation/datetime')
def augment_date(source, propertyinfo, augmented, failed):
    '''
    Sample propertyinfo
    {
        "property": "start_date",
        "enabled": true,
        "label": "Start date",
        "tags": ["property:type=date"],
        "composite": [
            "start"
        ]
    }

    >>> from zen import augmentation
    >>> source = [{u"id": u"_1", u"label": u"_1", u"end": u"2011-01-01"}]
    >>> propinfo = {u"enabled": True, u"property": u"iso_end_date", u"enabled": True, u"label": "ISO end date", u"tags": [u"property:type=date"], "composite": ["end"]}
    >>> result = []
    >>> failed = {}
    >>> augmentation.augment_date(source, propinfo, result, failed)
    >>> result
    [{u'iso_end_date': '2011-01-01T00:00:00+0000', u'id': u'_1', u'label': u'_1'}]
    >>> failed
    {}
    [{u'shredded': [u'text', u'text', u'text'], u'id': u'_1', u'label': u'_1'}]
    '''
    #It is possible for us to get passed in a data profile which includes a property of type datewhich is not meant to be augmented.
    #In that case there will be no composite param
    if not u"composite" in propertyinfo:
        return
    composite = propertyinfo[u"composite"]
    pname = propertyinfo.get(u"property", u'iso_datetime')
    def each_obj(obj, id):
        #Excel will sometimes give us dates as integers, which reflects in the data set coming back.
        #Hence the extra unicode conv.
        #FIXME: should fix in freemix.json endpoint and remove from here
        date_parts = [ unicode(obj[k]) for k in composite if unicode(obj.get(k, u'')).strip() ]
        if not any(date_parts):
            failed.setdefault(pname, []).append({u'id': id, u'label': obj[u'label'], 'input': date_parts, 'reason': u'No date information found'})
            return
        date = u', '.join(date_parts)
        if logger: logger.debug("date input: " + repr(date))
        #FIXME: Think clearly about timezone here.  Consider defaults to come from user profile
        clean_date = smart_parse_date(date)
        if clean_date:
            try:
                augmented.append({u'id': id, u'label': obj[u'label'],
                                    pname: isobase(clean_date.utctimetuple()) + UTC.name})
            except ValueError:
                #strftime cannot handle dates prior to 1900.  See: http://docs.python.org/library/datetime.html#strftime-and-strptime-behavior
                augmented.append({u'id': id, u'label': obj[u'label'],
                                    pname: clean_date.isoformat()[:LEN_BASE_ISOFORMAT] + UTC.name})
        else:
            failed.setdefault(pname, []).append({u'id': id, u'label': obj[u'label'], 'input': date_parts, 'reason': u'Unable to parse date'})
    augment_wrapper(source, pname, failed, each_obj, 'augment_date')
    #if logger: logger.info('Exception in augment_date: ' + repr(e))
    return


@zservice(u'http://purl.org/com/zepheira/augmentation/luckygoogle')
def augment_luckygoogle(source, propertyinfo, augmented, failed):
    '''
    '''
    #logger.debug("Not found: " + place)
    #It is possible for us to get passed in a data profile which includes a property of type luckygoogle which is not meant to be augmented.
    #In that case there will be no composite param
    if not u"composite" in propertyinfo:
        return
    composite = propertyinfo[u"composite"]
    pname = propertyinfo.get(u"property", u'luckygoogle')
    for obj in source:
        try:
            objid = obj[u'id']
            #Excel will sometimes give us dates as integers, which reflects in the data set coming back.
            #Hence the extra unicode conv.
            #FIXME: should fix in freemix.json endpoint and remove from here
            item = u', '.join([ unicode(obj[k]) for k in composite if unicode(obj.get(k, u'')).strip() ])
            link = luckygoogle(item)
            if link:
                val = items_dict.setdefault(objid, {u'id': objid, u'label': obj[u'label']})
                val[pname] = link
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception, e:
            if logger: logger.info('Exception in augment_date: ' + repr(e))
            failureinfo = failure_dict.setdefault(objid, {u'id': objid, u'label': obj[u'label']})
            failureinfo[pname] = repr(e)
    return


@zservice(u'http://purl.org/com/zepheira/augmentation/shredded-list')
def augment_shredded_list(source, propertyinfo, augmented, failed):
    '''
    See: http://community.zepheira.com/wiki/loc/ValidPatternsList

    >>> from zen import augmentation
    >>> source = [{u"id": u"_1", u"label": u"_1", u"orig": u"text, text, text"}]
    >>> propinfo = {u"delimiter": u",", u"extract": u"orig", u"property": u"shredded", u"enabled": True, u"label": "shredded result", u"tags": [u"property:type=text"]}
    >>> result = []
    >>> failed = []
    >>> augmentation.augment_shredded_list(source, propinfo, result, failed)
    >>> result
    [{u'shredded': [u'text', u'text', u'text'], u'id': u'_1', u'label': u'_1'}]

    >>> source = [{u"id": u"_1", u"label": u"_1", u"orig": u"text, text and text"}]
    >>> propinfo = {u"pattern": u"(,)|(and)", u"extract": u"orig", u"property": u"shredded", u"enabled": True, u"label": "shredded result", u"tags": [u"property:type=text"]}
    >>> result = []
    >>> failed = []
    >>> augmentation.augment_shredded_list(source, propinfo, result, failed)
    >>> result
    [{u'shredded': [u'text', u'text', u'text'], u'id': u'_1', u'label': u'_1'}]
    '''
    #It is possible for us to get passed in a data profile which includes a property of type shredded_list which is not meant to be augmented.
    #In that case there will be no extract param
    if not u"extract" in propertyinfo:
        return
    extract = propertyinfo[u"extract"]
    pname = propertyinfo.get(u"property", u'shreddedlist')
    pattern = propertyinfo.get(u"pattern")
    if pattern: pattern = re.compile(pattern)
    delim = propertyinfo.get(u"delimiter", u',')
    def each_obj(obj, id):
        if pattern:
            text = obj[extract]
            start = 0
            result = []
            #FIXME: Needs to be better spec'ed
            for m in pattern.finditer(text):
                result.append(text[start: m.start()].strip())
                start = m.end() + 1
            result.append(text[start:].strip())
        else:
            result = [ item.strip() for item in obj[extract].split(delim) ]
        if logger: logger.debug("augment_shredded_list: " + repr((obj[extract], pattern, delim)))
        if logger: logger.debug("result: " + repr(result))
        if result:
            augmented.append({u'id': id, u'label': obj[u'label'],
                                pname: result})
    augment_wrapper(source, pname, failed, each_obj, 'augment_shredded_list')
    return

