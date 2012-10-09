from django.shortcuts import render

from recollection.apps.discover.models import CuratedExhibit

def front_page(request):
    """
    Render the home page.
    """
    featured_exhibits = CuratedExhibit.objects.live('front-page')
    return render(
            request,
            'front_page.html',
            {'featured_exhibits': featured_exhibits}
            )
