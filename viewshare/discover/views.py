from django.shortcuts import render

from viewshare.discover.models import CuratedExhibit

def front_page(request):
    """
    Render the home page.
    """
    featured_exhibits = CuratedExhibit.objects.live('front_page')
    return render(
            request,
            'recollection/templates/front_page.html',
            {'featured_exhibits': featured_exhibits}
            )
