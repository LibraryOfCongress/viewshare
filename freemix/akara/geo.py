'''
Basic geocoder functions
'''

import sys, urllib, urllib2
import logging

from amara.thirdparty import httplib2, json
from amara.lib.iri import join

from freemix.akara.latlong import latlong

class local_geonames(object):
    '''
    >>> from freemix.akara.geo import local_geonames
    >>> lg = local_geonames('/Users/uche/.local/lib/akara/geonames.sqlite3')
    >>> lg('Superior, CO')
    {"Superior, CO": "39.95276,-105.1686"}
    >>> lg('Georgia')
    {"Georgia": "42,43.5"}
    '''
    def __init__(self, support_dbfile, hooks=[], logger=logging):
        self._support_dbfile = latlong(support_dbfile)
        self._logger = logger
        for h in hooks:
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


#Built-in hook functions
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


GEONAMES_FREE_SERVICE_ENDPOINT = "http://api.geonames.org/searchJSON?"

class geonames_service(object):
    #http://www.geonames.org/export/geonames-search.html
    '''
    >>> from freemix.akara.geo import geonames_service
    >>> lg = geonames_service(user='moi')
    >>> lg('Superior, CO')
    {"Superior, CO": "39.934186,-105.157990"}
    >>> lg('Georgia')
    {"Georgia": "41.999981,43.499905"}
    '''
    def __init__(self, hooks=[], user=None, logger=logging, servicebase=GEONAMES_FREE_SERVICE_ENDPOINT):
        self._servicebase = servicebase
        self._logger = logger
        self._user = user
        for h in hooks:
            h(self)
        return

    def __call__(self, place):
        query = urllib.urlencode(dict(username=self._user, q=place.encode('utf-8'), maxRows='2'))
        #print self._servicebase + query
        req = self._servicebase + query
        stream = urllib2.urlopen(req)
        resultset = json.load(stream)
        #print resultset.get(u'geonames')
        if resultset.get(u'geonames'):
            result = resultset[u'geonames'][0]
            #lat, long_ = result[u'lat'], result[u'lng']
            ll = "{lat},{lng}".format(**result)
            self._logger.debug(u"geolookup via geonames {0} yields: {1}".format(self._servicebase + query, repr((place, ll))))
            return {place: ll} if ll else {}
        else:
            return {}

