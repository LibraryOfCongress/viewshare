
# -*- encoding: utf-8 -*-

# Copyright 2008-2009 Zepheira LLC

'''
OAI tools - evolution of oaitools.py in akara demos
'''

import time, logging
import urllib

from amara import bindery
from amara.bindery.model import examplotron_model, generate_metadata, metadata_dict
from amara.lib import U
from amara.pushtree import pushtree
from amara.thirdparty import httplib2

OAI_NAMESPACE = u"http://www.openarchives.org/OAI/2.0/"

#OAI-PMH verbs:
# * Identify
# * ListMetadataFormats
# * ListSets
# * GetRecord
# * ListIdentifiers
# * ListRecords

#Useful:
# http://www.nostuff.org/words/tag/oai-pmh/
# http://libraries.mit.edu/dspace-mit/about/faq.html
# http://wiki.dspace.org/index.php/OaiInstallations - List of OAI installations harvested by DSpace
#Examples:
# http://eprints.sussex.ac.uk/perl/oai2?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:eprints.sussex.ac.uk:67
# http://dspace.mit.edu/oai/request?verb=Identify
# http://dspace.mit.edu/oai/request?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:dspace.mit.edu:1721.1/5451

#Based on: http://dspace.mit.edu/oai/request?verb=GetRecord&metadataPrefix=oai_dc&identifier=oai:dspace.mit.edu:1721.1/5451

#http://dspace.mit.edu/search?scope=%2F&query=stem+cells&rpp=10&sort_by=0&order=DESC&submit=Go

DSPACE_SEARCH_PATTERN = u"http://dspace.mit.edu/search?%s"

DSPACE_ARTICLE = u"http://www.dspace.com/index/details.stp?ID="

RESULTS_DIV = u"aspect_artifactbrowser_SimpleSearch_div_search-results"

DSPACE_OAI_ENDPOINT = u"http://dspace.mit.edu/oai/request"

DSPACE_ARTICLE_BASE = u"http://dspace.mit.edu/handle/"

DSPACE_ID_BASE = u"oai:dspace.mit.edu:"

PREFIXES = {u'o': u'http://www.openarchives.org/OAI/2.0/'}

class oaiservice(object):
    """
    >>> from zen.oai import oaiservice
    >>> remote = oaiservice('http://dspace.mit.edu/oai/request')
    >>> sets = remote.list_sets()
    >>> sets[0]
    >>> first_set = sets[0][0]
    >>> records = remote.list_records(first_set)
    >>> records

    If you want to see the debug messages, just do (before calling read_contentdm for the first time):

    >>> import logging; logging.basicConfig(level=logging.DEBUG)

    """
    def __init__(self, root, logger=logging, cachedir='/tmp/.cache'):
        '''
        root - root of the OAI service endpoint, e.g. http://dspace.mit.edu/oai/request
        '''
        self.root = root
        self.logger = logger
        self.h = httplib2.Http(cachedir)
        return
    
    def list_sets(self):
        #e.g. http://dspace.mit.edu/oai/request?verb=ListSets
        qstr = urllib.urlencode({'verb' : 'ListSets'})
        url = self.root + '?' + qstr
        self.logger.debug('OAI request URL: {0}'.format(url))
        start_t = time.time()
        resp, content = self.h.request(url)
        retrieved_t = time.time()
        self.logger.debug('Retrieved in {0}s'.format(retrieved_t - start_t))
        sets = []

        def receive_nodes(n):
            sets.append((n.xml_select(u'string(o:setSpec)', prefixes=PREFIXES), n.xml_select(u'string(o:setName)', prefixes=PREFIXES)))

        pushtree(content, u"o:OAI-PMH/o:ListSets/o:set", receive_nodes, namespaces=PREFIXES)
        return sets

    def get_record(self, id):
        pass

    def search(self, term):
        qstr = urllib.urlencode({'verb' : 'GetRecord', 'metadataPrefix': 'oai_dc', 'identifier': dspace_id})
        url = DSPACE_OAI_ENDPOINT + '?' + qstr
        logger.debug('DSpace URL: ' + str(url))
        #keywords = [ (k.strip(), JOVE_TAG) for k in unicode(row.xml_select(u'string(.//*[@class="keywords"])')).split(',') ]

        doc = bindery.parse(url, model=OAI_MODEL)
        #print >> sys.stderr, list(generate_metadata(doc))
        resources, first_id = metadata_dict(generate_metadata(doc), nesteddict=False)
        record = doc.OAI_PMH

        resource = resources[first_id]

    def list_records(self, set):
        '''
        '''
        #e.g. http://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=oai_dc&set=hdl_1721.1_18193
        qstr = urllib.urlencode({'verb' : 'ListRecords', 'metadataPrefix': 'oai_dc', 'set': set})
        url = self.root + '?' + qstr
        self.logger.debug('OAI request URL: {0}'.format(url))
        start_t = time.time()
        resp, content = self.h.request(url)
        retrieved_t = time.time()
        self.logger.debug('Retrieved in {0}s'.format(retrieved_t - start_t))
        doc = bindery.parse(url, model=OAI_LISTRECORDS_MODEL)
        #print >> sys.stderr, list(generate_metadata(doc))
        records, first_id = metadata_dict(generate_metadata(doc),
                                          nesteddict=False)
        for id_, props in records:
            for k, v in props.iteritems():
                props[k] = [ U(item) for item in v ]

        return records

#
OAI_LISTSETS_XML = """<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>2011-03-14T18:26:05Z</responseDate>
  <request verb="ListSets">http://dspace.mit.edu/oai/request</request>
  <ListSets>
    <set>
      <setSpec>hdl_1721.1_18193</setSpec>
      <setName>1. Reports</setName>
    </set>
    <set>
      <setSpec>hdl_1721.1_18194</setSpec>
      <setName>2. Working Papers</setName>
    </set>
    <set>
      <setSpec>hdl_1721.1_18195</setSpec>
      <setName>3. Theses</setName>
    </set>
  </ListSets>
</OAI-PMH>
"""

OAI_LISTRECORDS_XML = """<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd" xmlns:o="http://www.openarchives.org/OAI/2.0/"
  xmlns:eg="http://examplotron.org/0/" xmlns:ak="http://purl.org/xml3k/akara/xmlmodel">
  <responseDate>2011-03-14T21:29:34Z</responseDate>
  <request verb="ListRecords" set="hdl_1721.1_18193" metadataPrefix="oai_dc">http://dspace.mit.edu/oai/request</request>
  <ListRecords>
    <record ak:resource="o:header/o:identifier">
      <header>
        <identifier>oai:dspace.mit.edu:1721.1/27225</identifier>
        <datestamp ak:rel="local-name()" ak:value=".">2008-03-10T16:34:16Z</datestamp>
        <setSpec>hdl_1721.1_18193</setSpec>
      </header>
      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <dc:title ak:rel="local-name()" ak:value=".">A methodology for the assessment of the proliferation resistance of nuclear power systems: topical report</dc:title>
          <dc:creator ak:rel="local-name()" ak:value=".">Papazoglou, Ioannis Agamennon</dc:creator>
          <dc:subject ak:rel="local-name()" ak:value=".">Nuclear disarmament</dc:subject>
          <dc:description ak:rel="local-name()" ak:value=".">A methodology for the assessment of the differential resistance of various nuclear power systems to ...</dc:description>
          <dc:date>2005-09-15T14:12:55Z</dc:date>
          <dc:date ak:rel="local-name()" ak:value=".">2005-09-15T14:12:55Z</dc:date>
          <dc:date>1978</dc:date>
          <dc:type ak:rel="local-name()" ak:value=".">Technical Report</dc:type>
          <dc:format ak:rel="local-name()" ak:value=".">6835289 bytes</dc:format>
          <dc:format>7067243 bytes</dc:format>
          <dc:format>application/pdf</dc:format>
          <dc:format>application/pdf</dc:format>
          <dc:identifier ak:rel="'handle'" ak:value=".">04980676</dc:identifier>
          <dc:identifier>http://hdl.handle.net/1721.1/27225</dc:identifier>
          <dc:language ak:rel="local-name()" ak:value=".">en_US</dc:language>
          <dc:relation ak:rel="local-name()" ak:value=".">MIT-EL</dc:relation>
          <dc:relation>78-021</dc:relation>
          <dc:relation>MIT-EL</dc:relation>
          <dc:relation>78-022</dc:relation>
        </oai_dc:dc>
      </metadata>
    </record>
    <resumptionToken expirationDate="2011-03-14T22:29:39Z">0001-01-01T00:00:00Z/9999-12-31T23:59:59Z/hdl_1721.1_18193/oai_dc/100</resumptionToken>
  </ListRecords>
</OAI-PMH>
"""


OAI_GETRECORD_XML = """<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:o="http://www.openarchives.org/OAI/2.0/"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd"
         xmlns:eg="http://examplotron.org/0/" xmlns:ak="http://purl.org/xml3k/akara/xmlmodel">
  <responseDate>2009-03-30T06:09:23Z</responseDate>
  <request verb="GetRecord" identifier="oai:dspace.mit.edu:1721.1/5451" metadataPrefix="oai_dc">http://dspace.mit.edu/oai/request</request>
  <GetRecord>
    <record ak:resource="o:header/o:identifier">
      <header>
        <identifier>oai:dspace.mit.edu:1721.1/5451</identifier>
        <datestamp ak:rel="local-name()" ak:value=".">2006-09-20T00:15:44Z</datestamp>
        <setSpec>hdl_1721.1_5443</setSpec>
      </header>
      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <dc:creator ak:rel="local-name()" ak:value=".">Cohen, Joshua</dc:creator>
          <dc:date ak:rel="local-name()" ak:value=".">2004-08-20T19:48:34Z</dc:date>
          <dc:date>2004-08-20T19:48:34Z</dc:date>
          <dc:date>1991</dc:date>
          <dc:identifier ak:rel="'handle'" ak:value=".">http://hdl.handle.net/1721.1/5451</dc:identifier>
          <dc:description ak:rel="local-name()" ak:value=".">Cohen's Comments on Adam Przeworski's article "Could We Feed Everyone?"</dc:description>
          <dc:format>2146519 bytes</dc:format>
          <dc:format>application/pdf</dc:format>
          <dc:language>en_US</dc:language>
          <dc:publisher ak:rel="local-name()" ak:value=".">Politics and Society</dc:publisher>
          <dc:title ak:rel="local-name()" ak:value=".">"Maximizing Social Welfare or Institutionalizing Democratic Ideals?"</dc:title>
          <dc:type>Article</dc:type>
          <dc:identifier>Joshua Cohen, "Maximizing Social Welfare or Institutionalizing Democratic Ideals?"; Politics and Society, Vol. 19, No. 1</dc:identifier>
        </oai_dc:dc>
      </metadata>
    </record>
  </GetRecord>
</OAI-PMH>
"""

OAI_GETRECORD_MODEL = examplotron_model(OAI_GETRECORD_XML)
OAI_LISTRECORDS_MODEL = examplotron_model(OAI_LISTRECORDS_XML)

