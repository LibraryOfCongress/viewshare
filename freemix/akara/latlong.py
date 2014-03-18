"""latlong - get latitude and longitude positions for geographical names

The names are based on the geonames.org data dumps, available from
   http://download.geonames.org/export/

This library uses a SQLite data base created by "latlong_loader.py".

Use the program "latlong_loader.py" to create a sqlite database
containing a cleaned and normalized data set. The database tables are:

  - geonames is a set of cities, "states", and country code information
       indexed by the unique geonameid which comes from geoname.org
  - country_alias contains alternate names for each country code
  - state_alias contains information about USPS and Canadian postal regions
  - city_alias contains alternate names for a city, which might be
       a foreign name or an ASCII transliteration of non-ASCII characters

See the latlong_loader.py program for details.

In this context, "state" is one of the US states or Canadian provinces
(by postal code or the common English name), or the countries of the
Federated States of Micronesia, the Marshall Islands, Palau, Guan,
American Samoa, Northern Mariana Islands, Puerto Rico, or the Virgin
Islands, which can be referred to by name (as given here) or their ISO
nation code, which also happens to be the state code used by the USPS.

Only cities with populations of 1,000 or higher are considered,
although that is not a limitation of the schema.

Currently the country name may only be the normal name in English and
the two-letter or three-letter ISO country code. Local names (like
Sverige for Sweden) are not supported, although that is not a
limitation of the schema.

All names go through a normalization process which removes extra
spaces and converts the names to uppercase. The uppercase conversion
is based on the Unicode definitions.

The latlong class uses these tables to provide different types of
latitude, longitude lookup. The result is either a 2-element tuple of
latitude, longitude, as strings in decimal degrees, based on WGS 84.
If the name cannot be found, the functions return None.

In some cases multiple cities may match the same criteria, in which
case the city with the largest population wins. For example, the match
for "Belvedere, California" is near San Francisco, not Los Angeles and
the search for "Paris" in the world returns the city in France and not
the one in Texas.

The exceptions are "using_city_and_state_then_country" and
"using_city_and_country_then_state". The first finds the largest city
assuming the second name is a state, and if that fails, assumes the
second name is a country. The second uses the opposite search order.

"""

# Copyright (c) 2009 by Zepheira, LLC
# This module written by Andrew Dalke <dalke@dalkescientific.com>

import re
import sqlite3
import time

CITY_STATE_SQL = """
SELECT latitude, longitude
    FROM geoname
    WHERE geonameid IN
    (
      SELECT geonameid
      FROM geoname
      WHERE city_name = :city_name

      UNION

      SELECT geonameid
      FROM geoname
      WHERE city_asciiname = :city_name

      UNION

      SELECT geonameid
      FROM city_alias
      WHERE name = :city_name

  )  AND admin1_code = :admin1_code and country_code = :country_code
  ORDER BY population DESC
  limit 1
"""

CITY_COUNTRY_CODE_SQL = """
SELECT latitude, longitude
  FROM geoname
  WHERE geonameid in
  (
    SELECT geonameid
    FROM geoname
    WHERE city_name = :city_name

    UNION

    SELECT geonameid
    FROM geoname
    WHERE city_asciiname = :city_name

    UNION

    SELECT geonameid
    FROM city_alias
    WHERE name = :city_name
  ) AND country_code = :country_code 
  ORDER BY population DESC
  limit 1
"""

CITY_SQL = """
SELECT latitude, longitude
  FROM geoname
  WHERE geonameid in
  (
    SELECT geonameid
    FROM geoname
    WHERE city_name = :city_name

    UNION

    SELECT geonameid
    FROM geoname
    WHERE city_asciiname = :city_name

    UNION

    SELECT geonameid
    FROM city_alias
    WHERE name = :city_name
  )
  ORDER BY population DESC
  limit 1
"""

STATE_SQL = """
SELECT latitude, longitude
  FROM geoname
  WHERE geonameid in
  (
    SELECT geonameid
    FROM state_alias
    WHERE name = :state_name
  )
  ORDER BY population DESC
  limit 1
"""

RAW_LOOKUP_SQL = """
SELECT latitude, longitude
  FROM geoname
  WHERE geonameid in
  (
    SELECT geonameid
    FROM geoname
    WHERE country_code = :name

    UNION

    SELECT geonameid
    FROM country_alias
    WHERE name = :name

    UNION

    SELECT geonameid
    FROM geoname
    WHERE city_name = :name

    UNION

    SELECT geonameid
    FROM geoname
    WHERE city_asciiname = :name

    UNION

    SELECT geonameid
    FROM city_alias
    WHERE name = :name

    UNION

    SELECT geonameid
    FROM state_alias
    WHERE name = :name
  )
  ORDER BY population DESC
  limit 1
"""


## Handle all sorts of names like
# Kindhausen(Dorf)
# Stadt Winterthur(Kreis 1)/Altstadt
# Turns "U.S. Virgin Islands" -> "U.S.Virgin Islands"
#
# Short explaination: Get rid of spaces on either side
#   of something which isn't a word or space character.
#   Using the Unicode definition of those metacharacters.
#   Crossing my fingers and hoping that's correct.
_normalize_special = re.compile(ur"\s*([^\w\s])\s*", re.UNICODE).sub

def normalize_name(name):
    "Convert the name to normalized form for database searching"
    # Remove spaces on either side of special characters
    name = _normalize_special(ur"\1", name)

    # Remove extra spaces
    name = u" ".join(name.split())

    # Convert to upper-case and I'm done.
    return name.upper()

class state(object):
    """Internal class for holding information about each state"""
    def __init__(self, geonameid, name, admin1_code, country_code, is_a_country):
        self.geonameid = geonameid
        self.name = name
        self.admin1_code = admin1_code
        self.country_code = country_code
        self.is_a_country = is_a_country


class latlong(object):
    def __init__(self, connection_or_filename):
        if isinstance(connection_or_filename, basestring):
            connection = sqlite3.connect(connection_or_filename)
        else:
            connection = connection_or_filename
        if connection.row_factory is None:
            connection.row_factory = dict_factory
        self.conn = connection
        self._check_schema()
        self._cache_info()

    def _check_schema(self):
        c = self.conn.cursor()
        try:
            c.execute("select count(*) from geoname")
        except sqlite3.OperationalError:
            raise TypeError("geonames database is missing 'geoname' table")

    def _cache_info(self):
        self._cached_state_names = d = {}

        # Cache information about each state
        c = self.conn.cursor()
        c.execute("""
SELECT state_alias.geonameid, state_alias.name, geoname.admin1_code,
       geoname.country_code, state_alias.is_a_country
    FROM state_alias, geoname
    WHERE state_alias.geonameid = geoname.geonameid
""")
        for kwargs in c:
            d[kwargs["name"]] = state(**kwargs)

        # Get the possible country codes
        c.execute("""
SELECT country_code
    FROM geoname
    WHERE city_name is NULL and admin1_code is NULL
""")
        self._cached_country_codes = set([d["country_code"] for d in c])

        # Map from country name to country codes
        c.execute("""
SELECT country_alias.name, geoname.country_code
    FROM country_alias, geoname
    WHERE geoname.geonameid = country_alias.geonameid
""")
        self._country_to_country_code = dict(
            [(d["name"], d["country_code"]) for d in c])

    def _get_lat_long(self, sql, args):
        c = self.conn.cursor()
        #print "Searching"
        #print [arg.encode("utf-8") for arg in args]
        c.execute(sql, args)
        for result in c:
            return result["latitude"], result["longitude"]
        # Nothing worked. Give up.
        return None

    def using_city_state(self, city, state):
        """Find the largest city in the state

        >>> latlong.using_city_state("Miami", "FL")
        (u'25.77427', u'-80.19366')
        >>> latlong.using_city_state("Dona Ana", "New Mexico")
        (u'32.38954', u'-106.8139')
        >>> latlong.using_city_state(u"Do\u00F1a Ana", "New Mexico")  # n with tilde
        (u'32.38954', u'-106.8139')
        >>> latlong.using_city_state("Saskatoon", "SK")
        (u'52.11679', u'-106.63452')
        >>> latlong.using_city_state("Yooto", "NM")  # Navajo name for Santa Fe
        (u'35.68698', u'-105.9378')
        """
        city = normalize_name(city)
        state = normalize_name(state)
        try:
            state = self._cached_state_names[state]
        except KeyError:
            return None
        if state.is_a_country:
            return self.using_city_country_code(city, state.country_code)
        
        c = self.conn.cursor()
        return self._get_lat_long(CITY_STATE_SQL,
                                  dict(city_name=city, admin1_code=state.admin1_code,
                                       country_code=state.country_code))
    
    def using_city_country_code(self, city, country_code):
        """Find the largest city in the country named by the two-letter ISO country code

        >>> latlong.using_city_country_code("Paris", "FR")
        (u'48.85341', u'2.3488')
        >>> latlong.using_city_country_code("Miami", "US")
        (u'25.77427', u'-80.19366')
        """

        city = normalize_name(city)
        if country_code not in self._cached_country_codes:
            raise TypeError("Must use a two-digit ISO country code, not %r" %
                            (country_code,))
        return self._get_lat_long(CITY_COUNTRY_CODE_SQL,
                                  dict(city_name=city, country_code=country_code))

    def using_city_country(self, city, country):
        """Find the largest city in the given country, using the name of
        the country (in English) (in English) or its two-letter or
        three-letter country code:

        >>> latlong.using_city_country("Paris", "France")
        (u'48.85341', u'2.3488')
        >>> latlong.using_city_country("Gothenburg", "SE")
        (u'57.70716', u'11.96679')
        >>> latlong.using_city_country(u"G\u00f6teborg", "Sweden") # o-with-diaeresis
        (u'57.70716', u'11.96679')
        >>> latlong.using_city_country("Richmond", "Canada")  # The one in BC
        (u'49.17003', u'-123.13683')
        """
        # Use the country name to look up the country's two-letter code
        city = normalize_name(city)
        country = normalize_name(country)
        try:
            country_code = self._country_to_country_code[country]
        except KeyError:
            return None
        return self.using_city_country_code(city, country_code)

    def using_city_and_state_then_country(self, city, state_then_country):
        """Find the largest city in the named state. If that fails, try the name as a country
        
        Name ambiguities only exist with the two-letter ISO codes, such
        as "IN" for India or Indiana and "CA" for California and Canada.

        "Salem, IN" find the position of "Salem, Indiana" (pop. 6,172)
        and not "Salem, India" (pop. 1.5 million).

        >>> latlong.using_city_and_state_then_country("Salem", "IN")
        (u'38.60561', u'-86.10109')
        >>> latlong.using_city_and_state_then_country("Salem", "Indiana")
        (u'38.60561', u'-86.10109')
        >>> latlong.using_city_and_state_then_country("Salem", "India")
        (u'11.65', u'78.16667')

        """
        # In this function, states win over countries
        result = self.using_city_state(city, state_then_country)
        if result:
            return result
        return self.using_city_country(city, state_then_country)

    def using_city_and_country_then_state(self, city, country_then_state):
        """Find the largest city in the named country. If that fails, try the name as a state

        Name ambiguities only exist with the two-letter ISO codes, such
        as "IN" for India or Indiana and "CA" for California and Canada.

        "Richmond, CA" finds the position of Richmond, British Columbia
        (pop. 175,000) and not "Richmond, Ontario" (pop. 3,300) nor
        "Richmond, California" (pop. 100,000).

        >>> latlong.using_city_and_country_then_state("Richmond", "CA")
        (u'49.17003', u'-123.13683')
        >>> latlong.using_city_and_country_then_state("Richmond", "Canada")
        (u'49.17003', u'-123.13683')
        >>> latlong.using_city_and_country_then_state("Richmond", "California")
        (u'37.93576', u'-122.34775')
        """
        # In this function, countries win over states
        result = self.using_city_country(city, country_then_state)
        if result:
            return result
        return self.using_city_state(city, country_then_state)

    def using_city(self, city):
        """Find the largest city in the world with the given name.

        >>> latlong.using_city("Miami")
        (u'25.77427', u'-80.19366')
        >>> latlong.using_city("Paris")
        (u'48.85341', u'2.3488')
        >>> latlong.using_city("Gothenburg")
        (u'57.70716', u'11.96679')

        """
        city = normalize_name(city)
        return self._get_lat_long(CITY_SQL, dict(city_name=city))

    def using_state(self, state):
        """Find the largest state with the given name.

        >>> latlong.using_city("Georgia")
        (u'25.77427', u'-80.19366')
        >>> latlong.using_city("Paris")
        (u'48.85341', u'2.3488')
        >>> latlong.using_city("Gothenburg")
        (u'57.70716', u'11.96679')

        """
        state = normalize_name(state)
        return self._get_lat_long(STATE_SQL, dict(state_name=state))

    def raw_lookup(self, text):
        """Find the largest geographical entity in the world with the given name.

        >>> latlong.raw_lookup("Miami")
        (u'25.77427', u'-80.19366')
        >>> latlong.raw_lookup("Georgia")
        (u'42', u'43.5')

        """
        text = normalize_name(text)
        return self._get_lat_long(RAW_LOOKUP_SQL, dict(name=text))


# Make SQLite return dictionaries for the row results.
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

    
if __name__ == "__main__":
    #FIXME: doctest as below does not work because we have no SQL file to initialize the connection
    import doctest
    #doctest.testmod(verbose=True, raise_on_error=True)
