var loginForms = {};

loginForms.setFormState = function(form, enabled) {
    $('input', form).attr('disabled', !enabled);
    form.css('opacity', enabled ? 1 : 0.5);
    if (enabled) {
        $('input:reset', form).show();
    } else {
        $('input:reset', form).hide();
    }
};

loginForms.enableForm = function(form) {
    loginForms.setFormState(form, true);
};

loginForms.disableForm = function(form) {
    loginForms.setFormState(form, false);
};

loginForms.setSubmitState = function(form, enabled) {
    if (enabled) {
        $('input:submit', form).removeClass('disabled').attr('disabled', false);
    } else {
        $('input:submit', form).addClass('disabled').attr('disabled', true);
    }
}

loginForms.enableSubmit = function(form) {
    loginForms.setSubmitState(form, true);
};

loginForms.disableSubmit = function(form) {
    loginForms.setSubmitState(form, false);
};

loginForms.init = function() {
    $('input:submit').attr('disabled', true).addClass('disabled');
    $('input:reset').hide();
    $('input:text, input:password').attr('disabled', false);
    $('form.openid').data('alts', 'user_pass');
    $('form.user_pass').data('alts', 'openid');
    $('input:text, input:password', 'form.user_pass').live('keyup', function(e) {
        if ($('form.user_pass input:text').val().length > 0 || $('form.user_pass input:password').val().length > 0) {
            loginForms.disableForm($('form.' + $(this).parents('form').data('alts')));
            loginForms.enableForm($(this).parents('form'));
            loginForms.enableSubmit($(this).parents('form'));
        } else {
            loginForms.disableSubmit($(this).parents('form'));
        }
    });
    $('input:text', 'form.openid').bind('keyup', function(e) {
        if ($(this).val().length > 0) {
            loginForms.disableForm($('form.' + $(this).parents('form').data('alts')));
            loginForms.enableForm($(this).parents('form'));
            loginForms.enableSubmit($(this).parents('form'));
        } else {
            loginForms.disableSubmit($(this).parents('form'));
        }
    });
    $('input:reset').live('click', function(e) {
        $('form').each(function(i, el) {
            loginForms.enableForm($(el));
            loginForms.disableSubmit($(el));
        });
        $('input:reset').hide();
    });
};
