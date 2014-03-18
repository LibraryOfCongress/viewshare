import os
import urllib, urllib2
from urllib2 import urlopen
from freemix_akara import __version__
from server_support import server

RESOURCE_DIR = os.path.join(os.path.dirname(__file__), "resource")

def test_version():
    url = server() + "freemix.loader.revision"
    version = urlopen(url).read()
    assert version.find(__version__) > -1

def test_freemix_json():
    import simplejson

    url = server() + "freemix.json"
    req = urllib2.Request(url)
    data = open(os.path.join(RESOURCE_DIR, "load", "tiny.csv")).read()

    response = urllib2.urlopen(req, data)
    results = simplejson.load(response)

    assert "items" in results
