# -- %< --

#Useful sources related to data & file type ID
# * http://www.garykessler.net/library/file_sigs.html - "This table of file signatures (aka "magic numbers") is a continuing work-in-progress...."
# * http://stackoverflow.com/questions/43580/how-to-find-the-mime-type-of-a-file-in-python
# * http://www.fileformat.info/ - "The Digital Rosetta Stone "
# * http://www.wotsit.org/ - "This site contains information on hundreds of different file types, data types, hardware interface details and all sorts of other useful programming information; algorithms, source code, specifications, etc."
# * re: python-magic http://gavinjnet.blogspot.com/2007/05/python-file-magic.html

import sys, urllib
from subprocess import Popen, PIPE

# Requires python-magic <http://pypi.python.org/pypi/python-magic/0.1>
# >>> import magic
# >>> m = magic.Magic()
# >>> m.from_file("testdata/test.pdf")
# 'PDF document, version 1.2'
# >>> m.from_buffer(open("testdata/test.pdf").read(1024))
# 'PDF document, version 1.2'
# For MIME types
# >>> mime = magic.Magic(mime=True)
# >>> mime.from_file("testdata/test.pdf")
# 'application/pdf
'''
try:
    import magic
    def guess_mediatype(content):
        m = magic.Magic()
        pass
except ImportError:
    pass
'''

CHUNKSIZE = 1024
GENERIC_CDF_IMT = 'application/vnd.ms-office'

def guess_imt(body):
    '''
    Support function for freemix services.  Inital processing to guess media type of post body.
    '''
    #from magic import Magic
    #fileguesser = Magic(mime=True)
    process = Popen(guess_imt.MAGIC_FILE_CMD, stdin=PIPE, stdout=PIPE, shell=True)
    #Can't really use communicate because of issues with how it handles the buffer,
    #considering this will probably be a large body crammed into the pipe
    #Do it in chunks, instead
    #Besides, it seems the file command only reads as much input as it needs to to
    #spot the magic number before shutting up shop (manifested in IOError/Broken pipe),
    #so this will in most cases not save the overhead of feeding the entire body
    try:
        for i in xrange(0, len(body), CHUNKSIZE):
            process.stdin.write(body[i:i+CHUNKSIZE])
    except (KeyboardInterrupt, SystemExit):
        raise
    except IOError:
        pass
    process.stdin.close()
    #imt, perr = process.communicate(input=string_body)
    imt = process.stdout.read()
    returncode = process.wait()
    if not imt:
        #FIXME: L10N
        raise RuntimeError('Empty output from the command line.  Probably a failure.  Command line: "%s"'%cmdline)
        #raise ValueError('Empty output from the command line.  Probably a failure.  Command line: "%s"'%cmdline)
        imt = "application/unknown"
    if not returncode == 0:
        # Seeing this on Ubuntu 12.04, not sure why yet
        raise RuntimeError('Error status code %d from Popen, response: %s. Command line: "%s"'%(returncode,imt,cmdline))

    #print >> sys.stderr, imt
    #imt might look like:
    # * foo.dat: text/plain; charset=us-ascii
    # * foo.dat: text/plain charset=us-ascii
    if 'CDF' in imt or "Composite Document File" in imt:
        #Hackaround (see http://foundry.zepheira.com/issues/399)
        return GENERIC_CDF_IMT

    imt_pre = imt.split(':')[-1].split(';')[0].split()
    if len(imt_pre) > 0:
        imt = imt_pre[0].strip()
    else:
        # On Ubuntu 12.04, 'file -i' fails to report any media type for some XLS files
        imt = "application/octet-stream"

    #imt = fileguesser.from_buffer(body)
    return imt

guess_imt.MAGIC_FILE_CMD = 'file -i -'


'''
from subprocess import *

CHUNKSIZE = 1024

cmd = 'file -i -'
process = Popen(cmd, stdin=PIPE, stdout=PIPE, universal_newlines=True, shell=True)
data = open('/tmp/splitsSplitter00000000.xml', 'rb').read()
for i in xrange(0, len(data), CHUNKSIZE):
    process.stdin.write(data[i:i+CHUNKSIZE])

process.stdin.close()
#imt, perr = process.communicate(input=)
imt = process.stdout.read()
print imt
'''

