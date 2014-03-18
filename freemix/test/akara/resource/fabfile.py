"""
Install and manage Akara with Freemix transformations on ubuntu 9.10
"""

from fabric.api import * 
from fabric.context_managers import cd, settings
from fabric.contrib.files import sed, exists, append

import posixpath

env.base_path = env.get("base_path", "/opt/akara/")
env.requirements = env.get("requirements", "requirements.txt")
env.virtualenv = env.get("virtualenv", "production")
env.service_port=env.get("service_port", "8880")
env.owner=env.get("owner", None)
env.module=env.get("module", None)
env.target_module=env.get("target_module", env.module)

env.virtualenv_exe=env.get("virtualenv_exe", "/usr/local/bin/virtualenv")

def _pip_install(package, virtualenv=env.virtualenv, base_path=env.base_path,
                 owner=env.owner):
    if virtualenv:
        exe = posixpath.join(base_path, virtualenv, "bin/pip")
    else:
        exe = "pip"
    log = posixpath.join(base_path, virtualenv, "pip-log.txt")

    sudo("%s install -U --log=%s --quiet %s"%(exe,log, package), user=owner)


def adduser(username, home=None):
    """
    Adds a new user to the system

    Arguments:
        username -- the username to add
        home -- the home directory of the new user (optional)
    """
    sudo ("useradd  %s %s" % 
           ("-d %s"%home if home else "",
           username))

def system_upgrade():
    """
    Update all system packages to the latest stable versions 
    """
    sudo ("aptitude -y -q update", pty=True)
    sudo ("aptitude -y -q safe-upgrade", pty=True)

def install_python_dev():
    """
    Install system wide python tools

    Ubuntu currently doesn't provide a recent enough version of virtualenv, so
    install it using pip.
    """
    sudo ("apt-get -y -q install build-essential python-pip python-dev", pty=True)
    sudo ('apt-get -y -q install mercurial', pty=True)

    _pip_install("distribute", virtualenv=False)
    _pip_install("virtualenv", virtualenv=False)

def prepare(upgrade=True):
    """
    Optionally upgrades system packages and installs python tools

    Keyword arguments:
        upgrade -- invoke system_upgrade if True
    """
    if upgrade:
        system_upgrade()
    install_python_dev()

def create_virtualenv(virtualenv=env.virtualenv, 
                      owner=env.owner,
                      base_path=env.base_path,
                      use_site_packages='false'):
    """
    Creates a new virtual environment

    Arguments:
        virtualenv -- the name of the new virtual environment
        owner -- the owner of the virtualenv.  Defaults to root
        base_path -- the directory in which to create the virtualenv
    """
    path = posixpath.join(base_path, virtualenv)
    if use_site_packages == 'true':
        site_packages = ''
    else:
        site_packages = '--no-site-packages'

    sudo("%s --distribute %s %s" % (env.virtualenv_exe, site_packages, path)) 
    if owner:
        sudo("chown -R %s:%s %s"%(owner, owner,path))

def install_requirements(virtualenv=env.virtualenv, 
                         requirements=env.requirements, 
                         base_path=env.base_path):
    """
    Install support libraries for akara. 

    Arguments:
        virtualenv -- the virtualenv in which to install
        requirements -- the path to the requirements.txt to be installed
        base_path -- the path containing virtualenvs
        owner -- the username that owns the virtualenv
    """
    _read_remote_config(virtualenv, base_path)

    path = posixpath.join(base_path, virtualenv, "requirements.txt")
    put(requirements, "/tmp/requirements.txt")
    sudo("chown %s /tmp/requirements.txt"%env.owner)
    sudo("mv /tmp/requirements.txt %s" % path, user=env.owner)
    _pip_install("-r  %s" % path, owner=env.owner, virtualenv=virtualenv,
                 base_path=base_path)

def _write_remote_config(virtualenv=env.virtualenv,
                         owner=env.owner,
                         service_port=env.service_port,
                         base_path=env.base_path):
    path = posixpath.join(base_path,virtualenv, ".fabricrc")
    if exists(path, use_sudo=True):
        sudo("rm %s"%path)
    sudo("touch %s"%path, user=owner)
    
    append("service_port=%s"%service_port, path, True)
    if owner:
        append("owner=%s"%owner, path, True)
    append("virtualenv=%s"%virtualenv, path, True)
    append("base_path=%s"%base_path, path, True)

def _read_remote_config(virtualenv=env.virtualenv, base_path=env.base_path):
    rc_path = posixpath.join(base_path, virtualenv, ".fabricrc")
    env.service_port = sudo("grep ^service_port %s | cut -d= -f 2"%rc_path)
    env.owner = sudo("grep ^owner %s | cut -d= -f 2"%rc_path)
    if len(env.owner) == 0:
        env.owner=None

def install(virtualenv=env.virtualenv, 
            requirements=env.requirements,
            owner=env.owner, 
            service_port=env.service_port, 
            base_path=env.base_path,
            use_site_packages='false'):
    """
    Installs an akara instance from scratch

    Arguments:
        virtualenv -- the virtualenv in which to install
        requirements -- the path to the requirements.txt to be installed
        base_path -- the path containing virtualenvs
        service_port -- the port on which akara should run
        owner -- the username that owns the virtualenv
    """
    create_virtualenv(virtualenv, owner, base_path, use_site_packages=use_site_packages)
    _write_remote_config(virtualenv, owner, service_port, base_path)
    install_requirements(virtualenv, requirements, base_path)
    setup_akara(virtualenv, base_path)

def setup_akara(virtualenv=env.virtualenv, base_path=env.base_path):
    
    _read_remote_config(virtualenv, base_path)

    path = posixpath.join(base_path, virtualenv)
    config_path = posixpath.join(path, "akara.conf")
    sudo("mkdir -p %s" % posixpath.join(path, "modules"), user=env.owner)
    sudo("mkdir -p %s" % posixpath.join(path, "logs"), user=env.owner)

    sudo("cp %s %s" %(
        "`%s/bin/python -c 'import akara;import posixpath;print(posixpath.dirname(akara.__file__))'`/akara.conf"%path, 
        config_path 
    ), user=env.owner)

    sed(config_path, "Listen = 8880", "Listen = %s"%env.service_port, use_sudo=True)
    sed(config_path, "~/.local/lib/akara", "%s" % path, use_sudo=True)

def upgrade(virtualenv=env.virtualenv, requirements=env.requirements,
            base_path=env.base_path):
    """
    Upgrades the current akara dependencies to the versions specified in
    requirements.txt.
    """

    _read_remote_config(virtualenv, base_path)
    with settings(warn_only=True):
        stop(virtualenv, base_path)
    install_requirements(virtualenv, requirements, base_path)

def uninstall(virtualenv=env.virtualenv, base_path=env.base_path):
    """
    Deletes an Akara instance

    Arguments:
        virtualenv -- the virtualenv in which to install
        base_path -- the path containing virtualenvs

    """
    with settings(warn_only=True):
        stop(virtualenv, base_path)    
    sudo ("rm -rf %s"%posixpath.join(base_path, virtualenv))

def _akara(command, virtualenv=env.virtualenv, base_path=env.base_path):
    _read_remote_config(virtualenv, base_path)
    sudo('%s -f %s %s' % (
        posixpath.join(base_path, virtualenv, "bin/akara"),
        posixpath.join(base_path, virtualenv, "akara.conf"),
        command
    ), user=env.owner, pty=True)

def start(virtualenv=env.virtualenv, base_path=env.base_path):
    """
    Starts the akara instance

    Arguments:
        virtualenv -- the virtualenv in which to install
        base_path -- the path containing virtualenvs
    """
    _akara("start", virtualenv, base_path) 

def stop(virtualenv=env.virtualenv, base_path=env.base_path):
    """
    Stops the akara instance

    Arguments:
        virtualenv -- the virtualenv in which to install
        base_path -- the path containing virtualenvs
    """
    _akara("stop", virtualenv, base_path)

def restart(virtualenv=env.virtualenv, base_path=env.base_path):
    """
    Restarts the akara instance

    Arguments:
        virtualenv -- the virtualenv in which to install
        base_path -- the path containing virtualenvs
    """
    _akara("restart", virtualenv, base_path)



def print_config(virtualenv=env.virtualenv, base_path=env.base_path):
    """
    Prints the owner and port of an akara instance

    Arguments:
        virtualenv -- the virtualenv for the instance
        base_path -- the path containing virtualenvs

    """
    run("cat %s"%posixpath.join(base_path, virtualenv, ".fabricrc"))


def register_module(module=env.module, target_module=env.target_module,
                    virtualenv=env.virtualenv,
                    config_file=None,
                    base_path=env.base_path):
    """
    Registers a module with akara.  The akara service should be stopped before
    calling this.

    Arguments:
        virtualenv -- a virtualenv containing an akara installation
        module -- a module on the PYTHONPATH to be registered
        target_module -- The module to use in registration.  defaults to the
        module value.
    """
    if not module:
        abort("Module required")
    if not target_module:
        target_module = module
    _read_remote_config(virtualenv, base_path)

    with cd( posixpath.join(base_path, virtualenv) ):

        new_conf = sudo("sed '/MODULES =/ a \    \"%s\",' < akara.conf > akara.conf.tmp"%target_module,user=env.owner)
        if new_conf.failed:
            abort("Unable to register module")
        else:
            sudo("mv akara.conf.tmp akara.conf",user=env.owner)

        # If config_file is specified, upload it and insert into akara.conf
        if config_file:
            put(config_file,'/tmp/akara-conf-add.txt')
            new_conf = sudo("sed '/Section 3:/ r /tmp/akara-conf-add.txt' < akara.conf > akara.conf.tmp",user=env.owner)
            if new_conf.failed:
                abort("Unable to insert module configuration into akara.conf")
            else:
                sudo("mv akara.conf.tmp akara.conf",user=env.owner)
            sudo('rm -f /tmp/akara-conf-add.txt')
