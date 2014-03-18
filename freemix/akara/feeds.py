import datetime

#See also: 


#def fixdate(d):
    #return u"%s-%s-%sT%s:%s:%s"%(d[0:4], d[4:6], d[6:8], d[8:10], d[10:12], d[12:14])
#    return u"%s-%s-%s"%(d[0:4], d[4:6], d[6:8])

def webfeed(body):
    import feedparser
    #Abstracted from Akara demo/modules/atomtools.py
    feed = feedparser.parse(body)
    from akara import logger; logger.info('%i entries: '%len(feed.entries))
    
    def process_entry(e):
        #from pprint import pformat; from akara import logger; logger.info('webfeed entry: ' + repr(pformat(dict(e)))); logger.info('webfeed entry: ' + repr(pformat(e.__dict__)))
        data = {}
        if hasattr(e, 'link'):
            data[u'id'] = e.link
            data[u'link'] = e.link
        if hasattr(e, 'summary'):
            data[u'description'] = e.summary
        if hasattr(e, 'title'):
            data[u'title'] = e.title
            data[u'label'] = e.title
        if hasattr(e, 'author_detail'):
            data[u'author_name'] = e.author_detail.name
        if hasattr(e, 'updated_parsed'):
            data[u'updated'] = datetime.datetime(*e.updated_parsed[:7]).isoformat().split('.')[0]
        if hasattr(e, 'tags'):
            data[u'tags'] = [ t['term'] for t in e.tags ]
        return data

    return [ process_entry(e) for e in feed.entries ] if feed.entries else None

