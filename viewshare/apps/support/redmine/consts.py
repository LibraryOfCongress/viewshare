"""
'Constants' in the Redmine schema.  It is possible, even probable, that
you will need to customize this based on your installation.
"""

REDMINE_CONSTS = {
   'TRACKER': {
       'BUG': 1,
       'FEATURE': 2,
       'SUPPORT': 3
    },
    'STATUS': {
       'NEW': 1,
       'IN_PROGRESS': 2,
       'RESOLVED': 3,
       'FEEDBACK': 4,
       'CLOSED': 5,
       'REJECTED': 6
    },
    'PRIORITY': {
        'LOW': 3,
        'NORMAL': 4,
        'HIGH': 5,
        'URGENT': 6,
        'IMMEDIATE': 7
    }
}
