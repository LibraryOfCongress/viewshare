import os
import urllib, urllib2
from urllib2 import urlopen
from freemix_akara import __version__
from server_support import server

RESOURCE_DIR = os.path.join(os.path.dirname(__file__), "resource")

def test_augment():
    import simplejson

    url = server() + "augment.freemix.json"
    req = urllib2.Request(url)
    data = open(os.path.join(RESOURCE_DIR, "augment", "augment_test1.js")).read()

    response = urllib2.urlopen(req, data)
    results = simplejson.load(response)

    assert "items" in results

def test_mix():
    import simplejson

    url = server() + "mix.freemix.json"
    req = urllib2.Request(url)
    data = open(os.path.join(RESOURCE_DIR, "mix", "mix.js")).read()

    response = urllib2.urlopen(req, data)
    results = simplejson.load(response)

    assert "items" in results
