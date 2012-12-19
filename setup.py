from setuptools import setup, find_packages

VERSION = __import__('viewshare').__version__

from distutils.command.sdist import sdist
from distutils.command.build import build
import os

def write_version_file():
    f = open("viewshare/version.py", "w")
    f.write('__version__ = "%s"\n' % (VERSION,))
    f.close()

def remove_version_file():
    os.remove("viewshare/version.py")

class sdist_version(sdist):

    def run(self):
        write_version_file()
        sdist.run(self)
        remove_version_file()

class build_version(build):

    def run(self):
        write_version_file()
        build.run(self)
        remove_version_file()

setup(
    name = "viewshare",
    version = VERSION,
    description = "Viewshare",
    url = "https://sourceforge.net/projects/loc-recollect/",
    packages = find_packages(exclude=('example_project',)),
    include_package_data=True,

    cmdclass = {'sdist': sdist_version, 'build': build_version}

)
