import os
import sys

target_version = "2.1.1"

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


# pinax 0.7.3 expects pinax.apps in the sys.path
try:
    import pinax
    sys.path.append(os.path.join(os.path.dirname(pinax.__file__), "apps"))
except:
    pass

