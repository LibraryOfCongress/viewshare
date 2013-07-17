'''

Outline of MODS elements:
 * http://www.loc.gov/standards/mods/mods-outline.html#identifier

MODS Schemata: 
 * http://www.loc.gov/standards/mods/mods-schemas.html

MODS examples:
 * http://www.loc.gov/standards/mods/v3/mods-userguide-examples.html
 * http://www.scripps.edu/~cdputnam/software/bibutils/mods_intro.html

See also:

For handling MARC (via conversion to SKOS): http://dcpapers.dublincore.org/ojs/pubs/article/view/916/912

'''

from itertools import groupby
from operator import itemgetter

from amara.xpath import datatypes
from amara.pushtree import pushtree
from amara.lib.util import coroutine, mcompose
from amara.lib import U
from amara.bindery.model.examplotron import examplotron_model

MODS_NAMESPACE = 'http://www.loc.gov/mods/v3'

MODS_MODEL_XML = '''<?xml version="1.0" encoding="UTF-8"?>
<modsCollection xmlns="http://www.loc.gov/mods/v3" xmlns:m="http://www.loc.gov/mods/v3"
  xmlns:eg="http://examplotron.org/0/" xmlns:ak="http://purl.org/xml3k/akara/xmlmodel">
<!--mods ID="ref1060-2004" ak:resource="@ID"-->
<mods ID="ref1060-2004" ak:resource="">
    <ak:rel name="'resource-type'" value="'biblio:item'"/>
    <titleInfo>
        <title ak:rel="" ak:context="parent::m:titleInfo/parent::m:mods">Akara Open Source Community</title>
    </titleInfo>
    <name ak:rel="constructedName" type="personal" ak:value="concat(m:namePart[@type='given'], m:namePart[@type='family'])">
        <namePart type="given">Uche</namePart>
        <namePart type="given">Gerald</namePart>
        <namePart type="family">Ogbuji</namePart>
        <role>
            <roleTerm authority="marcrelator" type="text" ak:rel="">author</roleTerm>
        </role>
        <displayForm>Uche Ogbuji</displayForm>
    </name>
    <originInfo>
        <dateIssued ak:rel="" ak:context="parent::m:originInfo/parent::m:mods">2004</dateIssued>
        <dateCaptured point="start" encoding="iso8601" ak:rel="" ak:context="parent::m:originInfo/parent::m:mods">20020702</dateCaptured>
        <issuance ak:rel="" ak:context="parent::m:originInfo/parent::m:mods">2004</issuance>
        <publisher ak:rel="" ak:context="parent::m:originInfo/parent::m:mods">X</publisher>
        <copyrightDate encoding="w3cdtf" ak:rel="" ak:context="parent::m:originInfo/parent::m:mods">2003</copyrightDate>
   	   	<place>
  	  	  	<placeTerm type="text" ak:rel="" ak:context="parent::m:place/parent::m:originInfo/parent::m:mods">New York</placeTerm>
       	</place>
    </originInfo>
    <language>
      	<languageTerm authority="iso639-2b" ak:rel="" ak:context="parent::m:language/parent::m:mods">eng</languageTerm>
    </language>
  	<physicalDescription>
  	  	<internetMediaType eg:occurs="*" ak:rel="" ak:context="parent::m:physicalDescription/parent::m:mods">text/html</internetMediaType>
        <digitalOrigin ak:rel="" ak:context="parent::m:physicalDescription/parent::m:mods">reformatted digital</digitalOrigin>
        <note ak:rel="physicalDescriptionNote" ak:context="parent::m:physicalDescription/parent::m:mods">100 f 6.3 tl</note>
     	<form authority="marcform" ak:rel="" ak:context="parent::m:physicalDescription/parent::m:mods">print</form>
      	<extent ak:rel="" ak:context="parent::m:physicalDescription/parent::m:mods">15 p.</extent>
  	</physicalDescription>
  	<abstract ak:rel="" ak:context="parent::m:mods">Web site promoting the candidacy of Fran Ulmer</abstract>
   	<subject authority="lcsh">
  	  	<topic eg:occurs="*" ak:rel="" ak:context="parent::m:subject/parent::m:mods">Gettysburg, Battle of, Gettysburg, Pa., 1863</topic>
  	  	<geographic eg:occurs="*" ak:rel="" ak:context="parent::m:subject/parent::m:mods">Alaska</geographic>
  	  	<temporal eg:occurs="*" ak:rel="" ak:context="parent::m:subject/parent::m:mods">Alaska</temporal>
   	   	<hierarchicalGeographic>
  	  	  	<country ak:rel="" ak:context="parent::m:hierarchicalGeographic/parent::m:subject/parent::m:mods">United States</country>
  	  	  	<city ak:rel="" ak:context="parent::m:hierarchicalGeographic/parent::m:subject/parent::m:mods">Fresno</city>
  	  	  	<state ak:rel="" ak:context="parent::m:hierarchicalGeographic/parent::m:subject/parent::m:mods">California</state>
  	  	  	<county ak:rel="" ak:context="parent::m:hierarchicalGeographic/parent::m:subject/parent::m:mods">Inyo</county>
  	  	</hierarchicalGeographic>
        <name ak:rel="'topic-name'" type="personal" ak:value="m:namePart"  ak:context="parent::m:subject/parent::m:mods"/>
  	</subject>
    <classification authority="lcc" ak:rel="" ak:context="parent::m:mods">E475.53 .A42</classification>
    <typeOfResource ak:rel="" ak:context="parent::m:mods">software, multimedia</typeOfResource>
    <genre authority="gmgpc" ak:rel="" ak:context="parent::m:mods">Landscape photographs</genre>
    <identifier displayLabel="Cite key" type="citekey" ak:rel="" ak:context="parent::m:mods">1060-2004</identifier>
    <location eg:occurs="*">
        <url displayLabel="Uche's home" usage="primary display" access="preview" ak:rel="" ak:context="parent::m:location/parent::m:mods">http://uche.ogbuji.net/</url>
    </location>
    <note type="system details" ak:rel="" ak:context="parent::m:mods">http://example.org/</note>
   	<relatedItem type="host" eg:occurs="*">
   	    <!-- Note: Looks like just about any of the top-level elements can go here -->
  	  	<!--
  	  	<titleInfo>
  	  	  	<title ak:rel="relatedItemTitle">Election 2002 Web Archive</title>
  	  	</titleInfo>
  	  	<location>
  	  	  	<url ak:rel="'relatedItemUrl'">http://www.loc.gov/minerva/collect/elec2002/</url>
  	  	</location>
  	  	-->
  	</relatedItem>
  	<accessCondition ak:rel="" ak:context="parent::m:mods">Personal, noncommercial use of this item is permitted in the United States of America. Please see http://digital.library.upenn.edu/women/ for other rights and restrictions that may apply to this resource.
    </accessCondition>
    <recordInfo>
      	<recordSource ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods">University of Pennsylvania Digital Library</recordSource>
      	<recordOrigin ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods"> MODS auto-converted from a simple Online Books Page metadata record. For details, see http://onlinebooks.library.upenn.edu/mods.html </recordOrigin>
      	<languageOfCataloging ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods">
      	  	<languageTerm type="code" authority="iso639-2b">eng</languageTerm>
      	</languageOfCataloging>
      	<recordContentSource ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods">Indiana University Digital Library Program</recordContentSource>
      	<recordCreationDate encoding="w3cdtf" ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods">2004-09-09</recordCreationDate>
      	<recordIdentifier ak:rel="" ak:context="parent::m:recordInfo/parent::m:mods">archives/cushman/P07803</recordIdentifier>
    </recordInfo>
</mods>
</modsCollection>
'''

MODS_MODEL = examplotron_model(MODS_MODEL_XML)

#lclocal is an extension namespace used in LC American Memory
PREFIXES = {u'm': MODS_NAMESPACE, u'lclocal': u'http://rs5.loc.gov:8081/ammem/lclocal_xml/document.xsd'}

def select(expr):
    #FIXME: pre-parse the pattern
    return lambda node: node.xml_select(expr, prefixes=PREFIXES)


def foreach(func):
    return lambda items: [ func(item) for item in items ]


DISPATCH_PATTERNS = {
    u'id': mcompose(select(u'@ID'), U),
    #u'name': mcompose(select(u'@ID'), U),
    u'label': mcompose(select(u'm:titleInfo/m:title'), U),
    u'title': mcompose(select(u'm:titleInfo/m:title'), U),
    u'subject-geographic': mcompose(select(u'm:subject/m:geographic'), foreach(U)),
    u'subject-topic': mcompose(select(u'm:subject/m:topic'), foreach(U)),
    u'subject-name-corporate': mcompose(select(u'm:subject/m:name[@type="corporate"]/m:namePart'), foreach(U)),
    u'subject-name-personal':  mcompose(select(u'm:subject/m:name[@type="personal"]/m:namePart'), foreach(U)),
    u'subject-temporal': mcompose(select(u'm:subject/m:temporal'), foreach(U)),
    u'dateCaptured-start': mcompose(select(u'm:originInfo/m:dateCaptured[@point="start"]'), U),
    u'dateCaptured-end': mcompose(select(u'm:originInfo/m:dateCaptured[@point="end"]'), U),
    u'location-url-active-site': mcompose(select(u'm:location/m:url[contains(@displayLabel, "Active")]'), foreach(U)),
    u'location-url-archived-site': mcompose(select(u'm:location/m:url[contains(@displayLabel, "Archived")]'), foreach(U)),
    u'location-url-digital-file-from-original-neg': mcompose(select(u'm:location/m:url[contains(@displayLabel, "digital file from original neg.")]'), foreach(U)),
    u'location-url': mcompose(select(u'm:location/m:url[not(@displayLabel)]'), foreach(U)),

    u'language': mcompose(select(u'm:language/m:languageTerm'), foreach(U)),
    u'form': mcompose(select(u'm:physicalDescription/m:form'), foreach(U)),
    u'internetMediaType': mcompose(select(u'm:physicalDescription/m:internetMediaType'), foreach(U)),
    u'digitalOrigin': mcompose(select(u'm:physicalDescription/m:digitalOrigin'), foreach(U)),
    u'targetAudience': mcompose(select(u'm:targetAudience'), foreach(U)),
    u'typeOfResource': mcompose(select(u'm:typeOfResource'), foreach(U)),
    u'genre': mcompose(select(u'm:genre'), foreach(U)),
    u'note': mcompose(select(u'm:note'), foreach(U)),
    u'physicalLocation-marcorg': mcompose(select(u'm:location/m:physicalLocation[@authority="marcorg"]'), foreach(U)),
    u'physicalLocation': mcompose(select(u'm:location/m:physicalLocation[not(@authority="marcorg")]'), foreach(U)),
    u'accessCondition': mcompose(select(u'm:accessCondition'), foreach(U)),

    #American Memory conventions
    u'name': mcompose(select(u'm:name/m:namePart'), foreach(U)),
    u'originInfo-dateCreated': mcompose(select(u'm:originInfo/m:dateCreated'), foreach(U)),
    #u'physicalDescription-form': mcompose(select(u'm:physicalDescription/m:form'), foreach(U)),
    u'relatedItem-titleInfo-title': mcompose(select(u'm:relatedItem/m:titleInfo/m:title'), foreach(U)),
    u'location-url-electronic-resource': mcompose(select(u'm:location/m:url[contains(@displayLabel, "electronic resource")]'), foreach(U)),
    #u'location-url-electronic-resource': mcompose(select(u'm:location/m:url'), U),
    u'location-physicalLocation-sponsoring-division': mcompose(select(u'm:location/m:physicalLocation[@displayLabel="sponsoring division"]'), foreach(U)),
    u'location-physicalLocation-other-repository': mcompose(select(u'm:location/m:physicalLocation[@displayLabel="other repository"]'), foreach(U)),
    u'location-physicalLocation': mcompose(select(u'm:location/m:physicalLocation[not(@displayLabel)]'), foreach(U)),
    #u'extension-relatedItem-identifier': mcompose(select(u'm:extension/m:relatedItem/m:identifier'), foreach(U)),
    #u'extension-lclocal.digObj-lclocal.aggregate': mcompose(select(u'm:extension/lclocal:digObj/lclocal:digObjRef/lclocal:aggregate'), foreach(U)),
    #u'extension-lclocal.digObj-lclocal.difitalID': mcompose(select(u'm:extension/lclocal:digObj/lclocal:digObjRef/lclocal:difitalID'), foreach(U)),
    #u'extension-lclocal.digObj-lclocal.displayType': mcompose(select(u'm:extension/lclocal:digObj/lclocal:displayType'), foreach(U)),
    #u'extension-lclocal.digObj-lclocal.handleInformation': mcompose(select(u'm:extension/lclocal:digObj/lclocal:handleInformation'), foreach(U)),
    #u'extension-lclocal.digitalOrigin': mcompose(select(u'm:extension/lclocal:digitalOrigin'), foreach(U)),
    #u'extension-lclocal.indexingID': mcompose(select(u'm:extension/lclocal:indexingID'), foreach(U)),
    #u'id': mcompose(select(u'@ID'), U),
    
    #7/8/10 additions
    u'dateIssued': mcompose(select(u'm:originInfo/m:dateIssued'), foreach(U)),
    u'issuance': mcompose(select(u'm:originInfo/m:issuance'), foreach(U)),
    u'place-code': mcompose(select(u'm:originInfo/m:place[@type="code"]'), foreach(U)),
    u'place-text': mcompose(select(u'm:originInfo/m:place[@type="text"]'), foreach(U)),
    u'publisher': mcompose(select(u'm:originInfo/m:publisher'), foreach(U)),
    u'extent': mcompose(select(u'm:physicalDescription/m:extent'), foreach(U)),
    u'subject-geographic-country': mcompose(select(u'm:subject/m:hierarchicalGeographic/m:country'), foreach(U)),
    u'subject-geographic-state': mcompose(select(u'm:subject/m:hierarchicalGeographic/m:state'), foreach(U)),
    u'subject-geographic-county': mcompose(select(u'm:subject/m:hierarchicalGeographic/m:county'), foreach(U)),
    u'descriptionStandard': mcompose(select(u'm:recordInfo/m:descriptionStandard'), foreach(U)),
    u'recordContentSource': mcompose(select(u'm:recordInfo/m:recordContentSource'), foreach(U)),
    u'recordCreationDate': mcompose(select(u'm:recordInfo/m:recordCreationDate'), foreach(U)),
    u'recordChangeDate': mcompose(select(u'm:recordInfo/m:recordChangeDate'), foreach(U)),
    u'recordIdentifier': mcompose(select(u'm:recordInfo/m:recordIdentifier'), foreach(U)),
    u'recordOrigin': mcompose(select(u'm:recordInfo/m:recordOrigin'), foreach(U)),
    u'abstract': mcompose(select(u'm:abstract'), foreach(U)),
    u'classification-lcc': mcompose(select(u'm:classification'), foreach(U)),
    u'abstract': mcompose(select(u'm:abstract'), foreach(U)),
    u'identifier-lccn': mcompose(select(u'm:identifier[@type="lccn"]'), foreach(U)),
    u'identifier-hdl': mcompose(select(u'm:identifier[@type="hdl"]'), foreach(U)),
    u'tableOfContents': mcompose(select(u'm:tableOfContents'), foreach(U)),
    u'titleInfo': mcompose(select(u'm:titleInfo/m:subTitle'), foreach(U)),
}


COVERAGE = [
    u'm:titleInfo',
    u'm:subject',
    u'm:originInfo',
    u'm:location',
    u'm:language',
    u'm:physicalDescription',
    u'm:targetAudience',
    u'm:typeOfResource',
    u'm:genre',
    u'm:note',
    u'm:accessCondition',

#    u'm:extension',
    u'm:name',
    u'm:relatedItem',

    u'm:recordInfo',
    u'm:abstract',
    u'm:identifier',
    u'm:tableOfContents',
    u'm:classification',
]


def mods2json(source, run_diagnostics=False):
    '''
    Parse MODS XML input source and return a flattened structure suitable for Exhibit JSON

    :param source: XML inpout source (string, file-like object (stream), file path, URI or
                   `amara.inputsource` object)

    :return: dictionary of extracted data
    :rtype: `dict`

    Examples:

    >>> from freemix.akara.mods import mods2json
    >>> XML = """<modsCollection xmlns="http://www.loc.gov/mods/v3">
    ... <mods ID="ref1060-2004">
    ...     <titleInfo>
    ...         <title>Akara Open Source Community</title>
    ...     </titleInfo>
    ...     <location>
    ...         <url displayLabel="Archived site">http://wayback.archive-it.org/877/*/http://www.ucsd.edu/</url>
    ...     </location>
    ...     <originInfo>
    ...         <dateCaptured encoding="iso8601" point="start">20071024230025</dateCaptured>
    ...         <dateCaptured encoding="iso8601" point="end">20071030230234</dateCaptured>
    ...     </originInfo>
    ...     <subject authority="keyword">
    ...         <topic>fire news, news fire, fire photos, firefighter, firefighter news, firefighting news, fire brigade, truck company, iaff, national fire news, fire service, Calfire, Cal Fire, CDF, fire department, USFS, fire fighter, fire department, wildland, firefighting, firemen, fireman, forest</topic>
    ...     </subject>
    ...     <subject>
    ...         <topic>California Wildfires, 2007</topic>
    ...     </subject>
    ... </mods>
    ... </modsCollection>"""
    >>> mods2json(XML)
    {u'subject-name-personal': [], u'subject-name-corporate': [], u'subject-topic': [u'fire news, news fire, fire photos, firefighter, firefighter news, firefighting news, fire brigade, truck company, iaff, national fire news, fire service, Calfire, Cal Fire, CDF, fire department, USFS, fire fighter, fire department, wildland, firefighting, firemen, fireman, forest', u'California Wildfires, 2007'], u'location-url-archived-site': u'http://wayback.archive-it.org/877/*/http://www.ucsd.edu/', u'label': u'', u'dateCaptured-end': u'20071030230234', u'dateCaptured-start': u'20071024230025', u'location-url-active-site': u'', u'id': u'ref1060-2004', u'subject-geographic': [], u'subject-temporal': []}

    '''
    items = []
    diagnostics = []
#    @coroutine
#    def handle_nodes():
#        while True:
#            node = yield
#            import sys; print >> sys.stderr, node
#            nodeinfo = ejsonize(node)
#            items.append(nodeinfo)
#        return

#    callback = handle_nodes()

    def callback(node):
        nodeinfo, unknowns = ejsonize(node, run_diagnostics)
        items.append(nodeinfo)
        if run_diagnostics:
            diagnostics.append(unknowns)
        return

    pushtree(source, u"m:mods", callback, namespaces={"m": MODS_NAMESPACE})
    if run_diagnostics:
        for count, (item, diag) in enumerate(zip(items, diagnostics)):
            diag[u'id'] = item[u'id'] = '_%i'%(count+1)
            if u'label' not in item:
                item[u'label'] = '_%i'%(count+1)
    else:
        for count, item in enumerate(items):
            if u'label' not in item:
                item[u'label'] = '_%i'%(count+1)
    #from akara import logger; logger.info('diagnostics: ' + repr((run_diagnostics, diagnostics)))
    return items, diagnostics


def ejsonize(node, run_diagnostics=False):
    nodeinfo = {}
    for key, func in DISPATCH_PATTERNS.items():
        val = func(node)
        if val:
            smart_map(nodeinfo, key, val)
        #nodeinfo[key] = func(node)
    #import sys; print >> sys.stderr, nodeinfo
    #removelist = []
    #for key, val in nodeinfo.items():
    #    if not val:
    #        removelist.append(key)
    #for key in removelist:
    #    del nodeinfo[key]
    
    covered = set()
    for expr in COVERAGE:
        result = node.xml_select(expr, prefixes=PREFIXES)
        for r in result:
            covered.add(r)
    unknowns = []
    if run_diagnostics:
        #from akara import logger; logger.info('ejsonize/run_diagnostics: ' + repr(run_diagnostics))
        for child in node.xml_select(u'*'):
            if child not in covered:
                unknowns.append(child.xml_qname)
    return nodeinfo, {u'unknown_top_level_elements': unknowns}


def smart_map(mapping, key, value):
    '''
    Updates mapping with a key/value pair.
    If the key does not exist, add the value as a scalar or list.
    If the key does exist, with scalar value, turn it into a list and extend with the value
    If the key does exist, with vector value, extend with the value
    '''
    if key not in mapping:
        mapping[key] = value
        return
    if isinstance(value, basestring):
        value = [value]
    else:
        try:
            iter(value)
        except TypeError:
            value = [value]
    try:
        mapping[key].extend(value)
    except AttributeError:
        #Current value in mapping is a scalar (note: basestrings do not implement extend)
        mapping[key] = [mapping[key]] + value
    return

