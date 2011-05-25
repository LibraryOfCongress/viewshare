# Connect securely over TLS
AUTH_LDAP_SERVER_URI = 'ldap://ldap.zepheira.com'
AUTH_LDAP_START_TLS = True

# Do not search/bind for login, direct bind; bind DN still needed for
# non-login operations.  Fill in values as needed.
AUTH_LDAP_USER_DN_TEMPLATE = 'uid=%(user)s,ou=people,dc=zepheira,dc=com'
AUTH_LDAP_BIND_DN = "dc=zepheira,dc=com"
AUTH_LDAP_BIND_PASSWORD = ""

# LDAP profile information to bring over
AUTH_LDAP_USER_ATTR_MAP = {
    "first_name": "givenName",
    "last_name": "sn",
    "email": "mail"
}

AUTH_LDAP_ALWAYS_UPDATE_USER = True

AUTHENTICATION_BACKENDS = (
    'django_auth_ldap.backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
)
