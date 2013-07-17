#zenlib.services
import re

#Mapping from service ID URI too URL template and/or callable
SERVICES = {}

def register_service(s):
    '''
    info - either a callable, which has its URL as the serviceid attribute
           or a tuple of (serviceid, callable)
    Note: registration of remote services is done in the Zen section of Akara config, for now
    '''
    if callable(s):
        SERVICES[s.serviceid] = s
    else:
        SERVICES[s[0]] = s[1]


#Bootstrap in the built-in ("local") services
if not SERVICES:
    import local
    from httpmodel import *


#Convenience decorator for registering services
def zservice(service_id):
    """Add the function as an Zen service

    This affects how the resource is registered in Zen:
      service_id - a string which identifies this service; should be a URL
    """
    def zregister(func):
        func.serviceid = service_id
        register_service(func)
        return func
    return zregister


#Convenience decorator for registering services implemented as Akara services
def zservice_wsgi():
    """Add the function as an Zen service

    This affects how the resource is registered in Zen:
      service_id - a string which identifies this service; should be a URL
    """
    def zregister(app):
        func.serviceid = app.service_id
        register_service(app.FIXME)
        return app
    return zregister


def service_proxy(sid):
    '''
    Returns a proxy callable corresponding to a service
    e.g. service(u'http://example.org/your-service')
    '''
    try:    
        return SERVICES[sid]
    except KeyError:
        service_base = find_peer_service(sid)
        def akara_service_wrapper(*args, **kwargs):
            OPENSEARCH_TEMPLATE_PAT.findall(qt)
        return 


#For parsing query templates
OPENSEARCH_TEMPLATE_PAT = re.compile(r'\{\W*.*?\}')


#e.g.
#>>> OPENSEARCH_TEMPLATE_PAT.findall('http://example.com/?q={searchTerms}&amp;pw={startPage?}&amp;format=rss')
#['{searchTerms}', '{startPage?}']
