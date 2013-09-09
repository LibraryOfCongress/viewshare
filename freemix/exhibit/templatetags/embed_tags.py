from compressor.css import CssCompressor
from compressor.js import JsCompressor
from compressor.signals import post_compress
from compressor.templatetags.compress import CompressorNode
from compressor.templatetags.compress import compress as base_compress

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
    template_name = "exhibit/embed/css_file.html"
    template_name_inline = "exhibit/embed/css_inline.html"

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

    def output(self, *args, **kwargs):
        # Revert to the base output method
        return super(CssCompressor, self).output(*args, **kwargs)


class LabJSCompressorNode(CompressorNode):

    def compressor_cls(self, kind, *args, **kwargs):
        compressors = {
            "css": LabCssCompressor,
            "js": LabJsCompressor,
        }
        if kind not in compressors.keys():
            raise template.TemplateSyntaxError(
                "The compress tag's argument must be 'js' or 'css'.")
        return compressors.get(kind)(*args, **kwargs)

    def debug_mode(self, context):
        return False

    def render(self, context, forced=True):
        return super(LabJSCompressorNode, self).render(context, forced=forced)


@register.tag
def compress(parser, token):
    node = base_compress(parser, token)
    return LabJSCompressorNode(node.nodelist,
                               node.kind,
                               node.mode,
                               node.name)
