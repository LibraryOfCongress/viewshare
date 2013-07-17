# -- %< --
# From geo.py

import sys, urllib
import logging

from amara.thirdparty import httplib2, json

from akara import logger
from akara import request
from akara.caching import cache
from akara import global_config
from akara.util import find_peer_service

from freemix.akara.latlong import latlong

GEOLOOKUP_URI = None

def setup():
    global GEOLOOKUP_URI, H
    GEOLOOKUP_URI = find_peer_service(u'http://purl.org/com/zepheira/services/geolookup.json')
    H = httplib2.Http('/tmp/.cache')
    return

def geolookup(place):
    '''
    A convenience function to call the local/peer geolookup service.

    Can only be called from within an Akara module handler.  E.g. the following sample module:
    
    -- %< --
from akara.services import simple_service
from zenlib.geo import geolookup

@simple_service("GET", "http://testing/report.get")
def s(place):
    return repr(geolookup('Superior,CO'))
    -- %< --
    Then test: curl -i "http://localhost:8880/s?place=Superior,CO"
    '''
    if not place:
        return None
    if isinstance(place, unicode):
        place = place.encode('utf-8')

    if not GEOLOOKUP_URI: setup()
    logger.debug('geolookup' + repr((place, GEOLOOKUP_URI)))
    resp, body = H.request(GEOLOOKUP_URI + '?place=' + urllib.quote(place))
    try:
        latlong = json.loads(body).itervalues().next()
        return latlong
    except (ValueError, StopIteration), e:
        logger.debug("Not found: " + repr(place))
        return None


GEOLOOKUP_CACHE = cache(
    'http://purl.org/com/zepheira/services/geolookup.json', expires=24*60*60)

class local_geonames(object):
    '''
    >>> from zen.geo import local_geonames
    >>> lg = local_geonames('/Users/uche/.local/lib/akara/geonames.sqlite3')
    >>> lg('Superior, CO')
    {"Superior, CO": "39.95276,-105.1686"}
    >>> lg('Georgia')
    {"Georgia": "42,43.5"}
    '''
    def __init__(self, support_dbfile, heuristics=[], logger=logging):
        self._support_dbfile = latlong(support_dbfile)
        self._logger = logger
        for h in heuristics:
            h(self)
        return

    def _single_name_query(self, place):
        '''
        This function is called for the case where a user queries for a single
        name with no formatting to suggest province or country
        '''
        return self._support_dbfile.raw_lookup(place)

    def __call__(self, place):
        components = [ comp.strip() for comp in place.split(u',')]
        if len(components) == 1:
            result = self._single_name_query(components[0])
        else:
            result = self._support_dbfile.using_city_and_state_then_country(components[0], components[-1])
        if result:
            (lat, long_) = result
            self._logger.debug(u"local geolookup: " + repr((place, lat, long_)))
            ll = "%s,%s"%(lat, long_)
            return {place: ll} if ll else {}
        else:
            return {}


#Heuristics functions
def US_STATE_FIRST(lg_obj):
    '''
    This is a ridiculously US centric heuristic, but here it is.
    It's for the case where formatting to suggest province or country is missing
    The rule is first to look for a US state with the name, and then
    Do a raw look up for the largest geo entity
    '''
    #XXX: this is using the closure to provide the instance rather than self
    #Should be OK, but could cause breakage if we ever do anything really funky
    #in class local_geonames.  We might want to revisit the monkey-patching mechanism some day
    def state_first_query(place):
        result = lg_obj._support_dbfile.using_state(place)
        if not result:
            result = lg_obj._support_dbfile.raw_lookup(place)
        return result
    lg_obj._single_name_query = state_first_query

