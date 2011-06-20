{% extends "exhibit/embed/base.js" %}
{% load freemix_helpers %}

{% block scripts %}
{{block.super}}
,"{%site_url STATIC_URL %}scripts/hide_items.js"
{% endblock %}
