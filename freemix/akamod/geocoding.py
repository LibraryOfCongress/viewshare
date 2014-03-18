#!/usr/bin/env python
# encoding: utf-8
"""
geocoding.py

Copyright 2008-2013 Zepheira LLC

Services for geocoding

This file is part of the open source Freemix project,
provided under the Apache 2.0 license.
See the files LICENSE and NOTICE for details.
Project home, documentation, distributions: http://foundry.zepheira.com/projects/zen

See:

 * http://purl.org/xml3k/akara
 * http://foundry.zepheira.com/projects/zen
 
= Defined REST entry points =


= Configuration =


Sample config:

class geocoding:
    cache_max_age = 86400
    geocoder = 'http://purl.org/com/zepheira/services/geocoders/local-geonames'
    geonames_dbfile = 'path/to/geonames.sqlite3'
    #e.g.: geonames_dbfile = Akara.ConfigRoot+'/caches/geonames.sqlite3'

= Notes on security =

To-do


"""

#See also: [[http://us.pycon.org/2009/tutorials/schedule/1PM4/|"Working with Geographic Information Systems (GIS) in Python"]]
#geohash.org


#configure to set: ipgeo.db 


import sys, re, os, time, sqlite3
import socket
import urllib2, urllib
import hashlib
import httplib
from datetime import datetime
from cStringIO import StringIO

import amara
from amara import bindery
from amara.thirdparty import json

from akara.services import simple_service
from akara.util import status_response
from akara import response
from akara import logger
from akara import module_config

#from freemix.akara.latlong import latlong
from freemix.akara.geo import local_geonames

LOCAL_GEONAMES = 'http://purl.org/com/zepheira/services/geocoders/local-geonames'

GEOCODER = module_config().get('geocoder', LOCAL_GEONAMES)

GEONAMES_PLUS_DBFILE = module_config().get('geonames_dbfile')

# Specifies the default max-age of across-the-board lookups
CACHE_MAX_AGE = str(module_config().get('cache_max_age'))


GEOCODERS = {
    LOCAL_GEONAMES: local_geonames(GEONAMES_PLUS_DBFILE, logger=logger),
}


SERVICE_ID = 'http://purl.org/com/zepheira/services/geolookup.json'
@simple_service('GET', SERVICE_ID, 'geolookup.json', 'application/json')
def geolookup_json(place=None):
    '''
    Transform to return the latitude/longitude of a place name, if found
    
    Sample request:
    * curl "http://localhost:8880/geolookup.json?place=Superior,%20CO"
    * curl "http://localhost:8880/geolookup.json?place=1600%20Amphitheatre%20Parkway,%20Mountain%20View,%20VA,%2094043"
    * curl "http://localhost:8880/geolookup.json?place=Cerqueira%20C%C3%A9sar%2C%20Brazil"
    * curl "http://localhost:8880/geolookup.json?place=Georgia"
    '''
    geoquery = place.decode('utf-8')
    logger.debug("geolookup_json: " + repr((geoquery, )))
    if CACHE_MAX_AGE: response.add_header("Cache-Control", "max-age="+CACHE_MAX_AGE)
    return GEOCODERS[GEOCODER](place)


##
## FIXME: CLEAN UP THE BELOW!
##







#GEOCODER = module_config().get('geocoder', "geocoders.get_geocoder('geonames')")
#GEOCODER = module_config().get('geocoder', "geocoders.get_geocoder('google', resource='maps')")
#GEOCODER = eval(GEOCODER)
#DBFILE = module_config().get('dbfile')

#See NOTES for info about setting


def state_lookup(s):
    result = US_STATES_GEO.xml_select(u'provinces/*[@abbr="%s"]'%s)
    return unicode(result[0]) if result else None


geocache = {}


def check_local_ll():
    ll = None
    if GEONAMES_PLUS_DBFILE:
        logger.debug('DBFILE: ' + repr(GEONAMES_PLUS_DBFILE))
        try:
            ll = latlong(GEONAMES_PLUS_DBFILE)
        except Exception as e:
            raise
    return ll


SERVICE_ID = 'http://purl.org/com/zepheira/services/geolookup-old.json'
@simple_service('GET', SERVICE_ID, 'geolookup-old.json', 'application/json')
def geolookup_json_old(place=None):
    '''
    Transform to return the latitude/longitude of a place name, if found
    
    Sample request:
    * curl "http://localhost:8880/geolookup-old.json?place=Superior,%20CO"
    * curl "http://localhost:8880/geolookup-old.json?place=1600%20Amphitheatre%20Parkway,%20Mountain%20View,%20VA,%2094043"
    * curl "http://localhost:8880/geolookup-old.json?place=Cerqueira%20C%C3%A9sar%2C%20Brazil"
    '''
    geoquery = place.decode('utf-8')
    #geoquery = "%s in %s, %s"%(address_line, city, state_name)
    if geoquery in geocache:
        ll = geocache[geoquery]
        return json.dumps({geoquery: ll}) if ll else "{}"

    #logger.debug("geolookup_json: " + repr((geoquery, )))
    components = [ comp.strip() for comp in geoquery.split(u',')]
    ll = None
    llquery = check_local_ll()
    if llquery:
        result = llquery.using_city_and_state_then_country(components[0], components[-1])
        if result:
            (lat, long_) = result
            logger.debug(u"local geolookup: " + repr((geoquery, lat, long_)))
            ll = "%s,%s"%(lat, long_)
            if CACHE_MAX_AGE: response.add_header("Cache-Control", "max-age="+CACHE_MAX_AGE)
            return json.dumps({geoquery: ll}) if ll else "{}"
        #Note: we're not updating geocache if the answer was found locally


    #Note: geonames.org doesn't like spaces after commas
    q = ','.join(components)
    try:
        place, (lat, long_) = GEOCODER.geocode(q, exactly_one=False).next()
        ll = "%0.03f,%0.03f"%(lat, long_)
    except (ValueError, urllib2.URLError, StopIteration), e:
        #FIXME: Consider using different cache control on lookup failures
        #import traceback; traceback.print_exc()
        logger.debug(u"geolookup error: " + repr((geoquery, e)))
        geoquery = geoquery.replace(u'"', u'')
        state = US_STATES_GEO.xml_select(u'provinces/*[@abbr="%s"]'%geoquery)
        if state:
            ll = "%s,%s"%(unicode(state[0].lat), unicode(state[0].long))
        else:
            state = US_STATES_GEO.xml_select(u'provinces/*[.="%s"]'%geoquery)
            if state:
                ll = "%s,%s"%(unicode(state[0].lat), unicode(state[0].long))
            else:
                ll = None
                response.status = status_response(httplib.NOT_FOUND)
    geocache[geoquery] = ll
    return json.dumps({geoquery: ll}) if ll else "{}"


geohashcache = {}

SERVICE_ID = 'http://purl.org/com/zepheira/services/geohash.json'
@simple_service('GET', SERVICE_ID, 'geohash.json', 'application/json')
def geohash_json(place=None):
    '''
    Transform to return the geohash of a place name, if found
    
    Sample request:
    * curl "http://localhost:8880/geohash.json?place=Superior,%20CO"
    '''
    geoquery = place[0]
    #geoquery = "%s in %s, %s"%(address_line, city, state_name)
    if geoquery in geohashcache:
        result = geohashcache[geoquery]
    else:
        query = urllib.urlencode({'q' : geoquery})
        url = 'http://geohash.org/?%s' % (query)
        #with closing(urllib.urlopen(url)) as search_results:
        #    json = json.loads(search_results.read())
        results = json['responseData']['results']
        return results[0]['url'].encode('utf-8') + '\n'

        try:
            place, (lat, long_) = GEOCODER.geocode(geoquery)
            latlong = "%0.03f,%0.03f"%(lat, long_)
        except ValueError, urllib2.URLError:
            state = US_STATES_GEO.xml_select(u'provinces/*[@abbr="%s"]'%geoquery)
            if state:
                latlong = "%s,%s"%(unicode(state[0].lat), unicode(state[0].long))
            else:
                state = US_STATES_GEO.xml_select(u'provinces/*[.="%s"]'%geoquery)
                if state:
                    latlong = "%s,%s"%(unicode(state[0].lat), unicode(state[0].long))
                else:
                    latlong = None
                    res = HTTPNotFound()
                    return res(environ, start_response)
        geocache[geoquery] = latlong
    return json.dumps({geoquery: latlong}) if latlong else "{}"


US_STATES_GEO = bindery.parse("""<provinces>
    <state lat="61.3850" abbr="AK" long="-152.2683">Alaska</state>
    <state lat="32.7990" abbr="AL" long="-86.8073">Alabama</state>
    <state lat="34.9513" abbr="AR" long="-92.3809">Arkansas</state>
    <state lat="33.7712" abbr="AZ" long="-111.3877">Arizona</state>
    <state lat="36.1700" abbr="CA" long="-119.7462">California</state>
    <state lat="39.0646" abbr="CO" long="-105.3272">Colorado</state>
    <state lat="41.5834" abbr="CT" long="-72.7622">Connecticut</state>
    <state lat="39.3498" abbr="DE" long="-75.5148">Delaware</state>
    <state lat="27.8333" abbr="FL" long="-81.7170">Florida</state>
    <state lat="32.9866" abbr="GA" long="-83.6487">Georgia</state>
    <state lat="21.1098" abbr="HI" long="-157.5311">Hawaii</state>
    <state lat="42.0046" abbr="IA" long="-93.2140">Iowa</state>
    <state lat="44.2394" abbr="ID" long="-114.5103">Idaho</state>
    <state lat="40.3363" abbr="IL" long="-89.0022">Illinois</state>
    <state lat="39.8647" abbr="IN" long="-86.2604">Indiana</state>
    <state lat="38.5111" abbr="KS" long="-96.8005">Kansas</state>
    <state lat="37.6690" abbr="KY" long="-84.6514">Kentucky</state>
    <state lat="31.1801" abbr="LA" long="-91.8749">Louisiana</state>
    <state lat="42.2373" abbr="MA" long="-71.5314">Massachusetts</state>
    <state lat="39.0724" abbr="MD" long="-76.7902">Maryland</state>
    <state lat="44.6074" abbr="ME" long="-69.3977">Maine</state>
    <state lat="43.3504" abbr="MI" long="-84.5603">Michigan</state>
    <state lat="45.7326" abbr="MN" long="-93.9196">Minnesota</state>
    <state lat="38.4623" abbr="MO" long="-92.3020">Missouri</state>
    <state lat="32.7673" abbr="MS" long="-89.6812">Mississippi</state>
    <state lat="46.9048" abbr="MT" long="-110.3261">Montana</state>
    <state lat="35.6411" abbr="NC" long="-79.8431">North Carolina</state>
    <state lat="47.5362" abbr="ND" long="-99.7930">North Dakota</state>
    <state lat="41.1289" abbr="NE" long="-98.2883">Nebraska</state>
    <state lat="43.4108" abbr="NH" long="-71.5653">New Hampshire</state>
    <state lat="40.3140" abbr="NJ" long="-74.5089">New Jersey</state>
    <state lat="34.8375" abbr="NM" long="-106.2371">New Mexico</state>
    <state lat="38.4199" abbr="NV" long="-117.1219">Nevada</state>
    <state lat="42.1497" abbr="NY" long="-74.9384">New York</state>
    <state lat="40.3736" abbr="OH" long="-82.7755">Ohio</state>
    <state lat="35.5376" abbr="OK" long="-96.9247">Oklahoma</state>
    <state lat="44.5672" abbr="OR" long="-122.1269">Oregon</state>
    <state lat="40.5773" abbr="PA" long="-77.2640">Pennsylvania</state>
    <state lat="41.6772" abbr="RI" long="-71.5101">Rhode Island</state>
    <state lat="33.8191" abbr="SC" long="-80.9066">South Carolina</state>
    <state lat="44.2853" abbr="SD" long="-99.4632">South Dakota</state>
    <state lat="35.7449" abbr="TN" long="-86.7489">Tennessee</state>
    <state lat="31.1060" abbr="TX" long="-97.6475">Texas</state>
    <state lat="40.1135" abbr="UT" long="-111.8535">Utah</state>
    <state lat="37.7680" abbr="VA" long="-78.2057">Virginia</state>
    <state lat="44.0407" abbr="VT" long="-72.7093">Vermont</state>
    <state lat="47.3917" abbr="WA" long="-121.5708">Washington</state>
    <state lat="44.2563" abbr="WI" long="-89.6385">Wisconsin</state>
    <state lat="38.4680" abbr="WV" long="-80.9696">West Virginia</state>
    <state lat="42.7475" abbr="WY" long="-107.2085">Wyoming</state>
    <province lat="14.2417" abbr="AS" long="-170.7197"/>
    <province lat="38.8964" abbr="DC" long="-77.0262">District of Columbia</province>
    <province lat="14.8058" abbr="MP" long="145.5505"/>
    <province lat="18.2766" abbr="PR" long="-66.3350">Puerto Rico</province>
    <province lat="18.0001" abbr="VI" long="-64.8199">US Virgin Islands</province>
</provinces>
""")

#Generated by $ python -c "import sys, amara; states=amara.pushbind(sys.argv[1], u'state'); print dict([(unicode(s.abbr), unicode(s.name)) for s in states])" "http://cvs.4suite.org/viewcvs/*checkout*/4Suite/Ft/Server/Share/Data/us-states.xml?content-type=text%2Fplain"
#US_STATES = {u'WA': u'Washington', u'DE': u'Delaware', u'WI': u'Wisconsin', u'WV': u'West Virginia', u'HI': u'Hawaii', u'FL': u'Florida', u'WY': u'Wyoming', u'NH': u'New Hampshire', u'NJ': u'New Jersey', u'NM': u'New Mexico', u'TX': u'Texas', u'LA': u'Louisiana', u'NC': u'North Carolina', u'ND': u'North Dakota', u'NE': u'Nebraska', u'TN': u'Tennessee', u'NY': u'New York', u'PA': u'Pennsylvania', u'CA': u'California', u'NV': u'Nevada', u'VA': u'Virginia', u'CO': u'Colorado', u'AK': u'Alaska', u'AL': u'Alabama', u'AR': u'Arkansas', u'VT': u'Vermont', u'IL': u'Illinois', u'GA': u'Georgia', u'IN': u'Indiana', u'IA': u'Iowa', u'OK': u'Oklahoma', u'AZ': u'Arizona', u'ID': u'Idaho', u'CT': u'Connecticut', u'ME': u'Maine', u'MD': u'Maryland', u'MA': u'Massachusetts', u'OH': u'Ohio', u'UT': u'Utah', u'MO': u'Missouri', u'MN': u'Minnesota', u'MI': u'Michigan', u'RI': u'Rhode Island', u'KS': u'Kansas', u'MT': u'Montana', u'MS': u'Mississippi', u'SC': u'South Carolina', u'KY': u'Kentucky', u'OR': u'Oregon', u'SD': u'South Dakota'}

#Other services:
#* http://www.wipmania.com/en/
def ip2geo(addr):
    '''
    See http://hostip.info for more info on the service used
    '''
    if g_db:
        rows = g_db.execute("select * from node where ip=?", (addr,))
        try:
            (ip, latlong, city, state, country, updated) = rows.next()
            logger.debug('Found in DB: ' + addr + ":" + latlong)
            state = state_lookup(state) or state
            return {'latlong': latlong, 'city': city, 'state': state, 'country': country}
        except StopIteration:
            pass

    logger.debug('Looking up geolocation for: ' + addr)
    request = "http://api.hostip.info/?ip=" + addr
    result = urllib2.urlopen(request).read()
    result = bindery.parse(result)
    info = result.HostipLookupResultSet.featureMember.Hostip
    try:
        longlat = unicode(info.ipLocation.PointProperty.Point.coordinates)
    except AttributeError:
        longlat = u''
    if longlat:
        long_, lat = longlat.split(',')
        latlong = u','.join((lat, long_))
        country = unicode(info.countryAbbrev)
        try:
            city, state = unicode(info.name).split(', ')
        except ValueError:
            city, state = unicode(info.name), u''
        if city.strip() == '(Unknown City?)': city = u''
    else:
        #Unknown
        latlong = country = city = state = u''
    state = state_lookup(state) or state
    if g_db:
        #if USAGE_LIMIT_EXCEEDED: return None
        res = g_db.execute("insert into node values (?, ?, ?, ?, ?, ?)", (addr, latlong, city, state, country, datetime.now(),))
        g_db.commit()
    return {'latlong': latlong, 'city': city, 'state': state, 'country': country}


g_db = None

def check_initdb():
    global g_db
    if g_db is None and DBFILE:
        g_db = sqlite3.connect(DBFILE)
        try:
            g_db.execute("select count(*) from node")
        except sqlite3.OperationalError:
            # Create table
            g_db.execute('''create table node
            (ip text, latlong text, city text, state text, country text, updated timestamp)''')
            g_db.commit()
    return


SERVICE_ID = 'http://purl.org/com/zepheira/services/ipgeo.json'
@simple_service('GET', SERVICE_ID, 'ipgeo.json', 'application/json')
#def excel2json(body, ctype, **params):
def ipgeo_json(addr=None):
    '''
    Transform to return the geolocation of an IP address (or host name), if found
    
    Sample request:
    * curl "http://localhost:8880/ipgeo.json?addr=www.zepheira.com"
    '''
    #import pprint; pprint.pprint(environ)
    #import uuid
    addr = addr
    try:
        ipaddr = unicode(socket.gethostbyname(addr))
    except socket.gaierror:
        response.status = status_response(httplib.NOT_FOUND)
        return ''
    check_initdb()
    result = ip2geo(ipaddr)
    return json.dumps({ipaddr: result}) if result else "{}"


#try:
#    geocache = json.load(open(geocachejsfile))
#except IOError:
#    geocache = {}
#GEOCODER = 
