from compressor.base import SOURCE_FILE, SOURCE_HUNK
from compressor.css import CssCompressor
from compressor.js import JsCompressor
from compressor.signals import post_compress
from compressor.templatetags.compress import CompressorNode
from compressor.templatetags.compress import compress as base_compress
from compressor.conf import settings

from django import template
from django.template.context import Context
from django.template.loader import render_to_string

register = template.Library()


class LabJsCompressor(JsCompressor):
    template_name = "exhibit/embed/js_file.html"
    template_name_inline = "exhibit/embed/js_inline.html"


    def render_output(self, mode, context=None):
        """
        Renders the compressor output with the appropriate template for
        the given mode and template context.
        """
        # Just in case someone renders the compressor outside
        # the usual template rendering cycle
        if 'compressed' not in self.context:
            self.context['compressed'] = {}

        self.context['compressed'].update(context or {})
        self.context['compressed'].update(self.extra_context)
        final_context = Context(self.context)
        post_compress.send(sender=self.__class__, type=self.type,
                           mode=mode, context=final_context)
        return render_to_string("exhibit/embed/%s_%s.html" %
                                (self.type, mode), final_context)



class LabCssCompressor(CssCompressor):
    template_name="exhibit/embed/css_file.html"
    template_name_inline="exhibit/embed/css_inline.html"

    def render_output(self, mode, context=None):
        """
        Renders the compressor output with the appropriate template for
        the given mode and template context.
        """
        # Just in case someone renders the compressor outside
        # the usual template rendering cycle
        if 'compressed' not in self.context:
            self.context['compressed'] = {}

        self.context['compressed'].update(context or {})
        self.context['compressed'].update(self.extra_context)
        final_context = Context(self.context)
        post_compress.send(sender=self.__class__, type=self.type,
                           mode=mode, context=final_context)
        return render_to_string("exhibit/embed/%s_%s.html" %
                                (self.type, mode), final_context)
#    def split_contents(self):
#        if self.split_content:
#            return self.split_content
#        self.media_nodes = []
#        for elem in self.parser.css_elems():
#            data = None
#            elem_name = self.parser.elem_name(elem)
#            elem_attribs = self.parser.elem_attribs(elem)
#            if elem_name == 'link' and elem_attribs['rel'].lower() == 'stylesheet':
#                basename = self.get_basename(elem_attribs['href'])
#                filename = self.get_filename(basename)
#                data = (SOURCE_FILE, filename, basename, elem)
#            elif elem_name == 'style':
#                data = (SOURCE_HUNK, self.parser.elem_content(elem), None, elem)
#            if data:
#                self.split_content.append(data)
#                media = elem_attribs.get('media', None)
#                # Append to the previous node if it had the same media type,
#                # otherwise create a new node.
#                if self.media_nodes and self.media_nodes[-1][0] == media:
#                    self.media_nodes[-1][1].split_content.append(data)
#                else:
#                    node = LabCssCompressor(content=self.parser.elem_str(elem),
#                                         context=self.context)
#                    node.split_content.append(data)
#                    self.media_nodes.append((media, node))
#        return self.split_content

    def output(self, *args, **kwargs):
        if (settings.COMPRESS_ENABLED or settings.COMPRESS_PRECOMPILERS or
                kwargs.get('forced', False)):
            # Populate self.split_content
            self.split_contents()
            if hasattr(self, 'media_nodes'):
                ret = []
                for media, subnode in self.media_nodes:
                    subnode.extra_context.update({'media': media})
                    ret.append(subnode.output(*args, **kwargs))
#                return ''.join(ret)
        return super(CssCompressor, self).output(*args, **kwargs)


class LabJSCompressorNode(CompressorNode):

    def compressor_cls(self, *args, **kwargs):
        compressors = {
            "css": LabCssCompressor,
            "js": LabJsCompressor,
        }
        if self.kind not in compressors.keys():
            raise template.TemplateSyntaxError(
                "The compress tag's argument must be 'js' or 'css'.")
        return compressors.get(self.kind)(*args, **kwargs)

    def debug_mode(self, context):
        return False

    def render(self, context, forced=True):
        return super(LabJSCompressorNode, self).render(context, forced=forced)


@register.tag
def compress(parser, token):
    node = base_compress(parser, token)
    return LabJSCompressorNode(node.nodelist,node.kind,node.mode,node.name)