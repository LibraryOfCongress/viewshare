from setuptools import setup, find_packages

VERSION = __import__('viewshare').__version__

setup(
    name = "viewshare",
    version = VERSION,
    description = "Viewshare",
    url = "https://github.com/LibraryOfCongress/viewshare",
    packages = find_packages(),
    include_package_data=True

)
