import os
import sys

#Final will be 2.0
target_version = "3.0.0"

def build_version():
    distance ="0"
    try:
        from subprocess import Popen, PIPE
        prev_tag,distance,revision = Popen(["git", "describe", "--match", "[0-9]*", "--long"],
                                           cwd=os.path.dirname(__file__),
                                           stdout=PIPE
                                          ).communicate()[0].strip().split("-")
        if distance ==  "0":
            return prev_tag
        elif prev_tag == target_version:
            return "%s.post%s"%(target_version, distance)

    except Exception as e:
        print e
    return "%s.dev%s"%(target_version, distance)

try:
    from .version import __version__
except ImportError:
    __version__=build_version()
