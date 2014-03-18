#Utilities

import hashlib
import functools
from wsgiref.util import request_uri
from amara.lib.util import first_item
from amara.lib.iri import absolutize#, split_fragment, relativize, basejoin, join
from itertools import dropwhile

from akara.util.moin import wiki_normalize

def sign_rulesheet(secret, rsheet):
    rsheet = wiki_normalize(rsheet)
    #Strip all whitespace from *end* of file since moin seems to
    rsheet = rsheet.rstrip()
    signed_parts = [
        '#', hashlib.sha1(secret + rsheet).hexdigest(), '\n', rsheet
        ]
    return ''.join(signed_parts)


def requested_imt(environ):
    # Choose a preferred media type from the Accept header, using application/json as presumed
    # default, and stripping out any wildcard types and type parameters
    #
    # FIXME: Ideally, this should use the q values and pick the best media type, rather than
    # just picking the first non-wildcard type.  Perhaps: http://code.google.com/p/mimeparse/
    accepted_imts = []
    accept_header = environ.get('HTTP_ACCEPT')
    if accept_header:
        accepted_imts = [ type.split(';')[0].strip() for type in accept_header.split(',') ]
    accepted_imts.append('application/json')
    #logger.debug('accepted_imts: ' + repr(accepted_imts))
    imt = first_item(dropwhile(lambda x: '*' in x, accepted_imts))
    return imt

def requested_lang(environ):
    # Similar to request_imt but for language instead of media type. Also similar
    # in its need for handling of q parameters
    #
    # No default language is used, so a return of None means "no preference"

    #logger.debug("in requested_lang, environ = "+repr(environ))

    accept_lang_header = environ.get('HTTP_ACCEPT_LANGUAGE')
    if accept_lang_header:
        accepted_langs = [ type.split(';')[0].strip() for type in accept_lang_header.split(',') ]
    else:
        return None
    
    if len(accepted_langs) > 0:
        return accepted_langs[0]
    else:
        return None

def use(pymodule):
    '''
    For rulesheets to use Python library modules as services
    
    e.g. use("pypath.to.yourmodule")
    '''
    #Just importing the module should be enough if they're registering services properly
    try:
        mod = __import__(pymodule)
    except ImportError as e:
        logger.debug('Unable to import declared module, so associated services will have to be available through discovery: ' + repr(e))
    return


def y_serial_memoize(cache, table, track_exceptions=False, logger=None):
    def memoized_wrapper(func):
        @functools.wraps(func)
        def wrapper(key):
            try:
                value = cache.select(key, table)
                if logger: logger.debug('Value from cache %s: %s'%(table, repr(value)))
                if value: return value
            except IOError:
                pass #Cache file probably not created
            except Exception as e:
                if logger: logger.debug('Exception looking up from cache %s, key %s: %s'%(table, key, repr(e)))

            try:
                value = func(key)
            except Exception as e:
                if logger: logger.debug('Exception computing from key %s: %s'%(key, repr(e)))
                if track_exceptions:
                    cache.insert(e, key, table)
                elif logger:
                    logger.debug('Will not be cached')
                raise
            else:
                #Only cache if function raised no exceptions
                cache.insert(value, key, table)
            return value
        return wrapper
    return memoized_wrapper


from akara.util import find_peer_service, guess_self_uri #for backward compat
