$(document).ready(function(e) {
    // Iterate through all frontendadmin links
    $('a.frontendadmin').live('click', function(e) {
        $(this).parent().css('background', 'transparent');
        // Load the frontendadmin form url into the parent container
        var parent = $(this).parent();
        var original = parent.clone();
        parent.load($(this).attr('href'), function() {
            var form = $('form', parent);
            $('input.cancel', form).click(function(ev) {
                if(confirm('Are you sure you want to cancel this action?')) {
                    parent.empty().append(original);
                } else {
                    ev.preventDefault();
                }
            });
            /** in case the ajax form ever improves
            form.submit(function(){
                $.post("{{ action_url }}", form.serialize(), function(html, status, xhr) {
                     $("#container-{{ action }}-{{ model_title|slugify }}").html(html);
                });
                return false;
            });
            */
        });
        e.preventDefault();
    }).live('mouseenter', function(e) {
        $(this).parent().css('background','#f6f6f6');
    }).live('mouseleave', function(e) {
        $(this).parent().css('background', 'transparent');
    });
});
