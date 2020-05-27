// loader message
var loader = {};
loader.active = false;
loader.show = function () {
    loader.active = true;
    setTimeout(loader.wait, 500);
};
loader.hide = function () {
    loader.active = false;
    $('#loader').addClass('d-none');
};
loader.wait = function () {
    if (loader.active) {
        $('#loader').removeClass('d-none');
    }
}
// check if logged
var login = {};
login.logged = false;
login.check = function () {
    var cookie = Cookies.get('user');
    if (cookie === undefined) {
        login.logged = false;
    } else {
        login.logged = true;
    }
    login.checked();
};
login.checked = function () {
    if (login.logged) {
        content.logged();
    } else {
        content.guest();
    }
};
// show content
var content = {};
content.logged = function () {
    $('.logged').removeClass('d-none');
};
content.guest = function () {
    $('.guest').removeClass('d-none');
};
// actions
var actions = {};
actions.failed = function () {
    $('#network-err').removeClass('d-none');
};
actions.csrf = function (callback) {
    $.ajax({
        type: 'GET',
        url: '/api/csrf',
        success: callback,
        error: actions.failed
    });
};
actions.form = function (id) {
    var arr = $(id).serializeArray();
    var data = {};
    for (var i = 0; i < arr.length; i++) {
        data[arr[i].name] = arr[i].value;
    }
    return data;
};
actions.redirect = function (route) {
    setTimeout((destiny) => {
        window.location.href = destiny;
    }, 500, route);
}
actions.signup = function (event) {
    event.preventDefault();
    $('#signup :submit').prop('disabled', true);
    $('.alert').addClass('d-none');
    $('input').removeClass('is-invalid');
    actions.csrf((data) => {
        $('input[name=_csrf]').val(data.token);
        var input = actions.form('#signup');
        $.ajax({
            type: 'POST',
            url: '/api/signup',
            data: input,
            error: actions.failed,
            success: (res) => {
                $('#signup :submit').prop('disabled', false);
                if (res.message === 'validation') {
                    var field = res.error.field;
                    var val = res.error.validation;
                    $('#' + field + '-' + val).removeClass('d-none');
                    $('input[name=' + field + ']').addClass('is-invalid');
                } else if (res.message === 'url') {
                    $('#username-url').removeClass('d-none');
                    $('input[name=username]').addClass('is-invalid');
                } else if (res.message === 'clone') {
                    $('#clone').removeClass('d-none');
                    $('input[name=username]').addClass('is-invalid');
                    $('input[name=email]').addClass('is-invalid');
                } else if (res.message === 'sent') {
                    $('#sent').removeClass('d-none');
                    actions.redirect('/signup/confirm/');
                }
            }
        });
    });
};
actions.confirm = function (event) {
    event.preventDefault();
    $('#confirm :submit').prop('disabled', true);
    $('.alert').addClass('d-none');
    $('input').removeClass('is-invalid');
    actions.csrf((data) => {
        $('input[name=_csrf]').val(data.token);
        var input = actions.form('#confirm');
        $.ajax({
            type: 'POST',
            url: '/api/signup/confirm',
            data: input,
            error: actions.failed,
            success: (res) => {
                $('#confirm :submit').prop('disabled', false);
                if (res.type === 'danger') {
                    $('input[name=token]').addClass('is-invalid');
                }
                $('#' + res.message).removeClass('d-none');
            }
        });
    });
}
actions.resend = function (event) {
    event.preventDefault();
    $('#resend :submit').prop('disabled', true);
    $('.alert').addClass('d-none');
    $('input').removeClass('is-invalid');
    actions.csrf((data) => {
        $('input[name=_csrf]').val(data.token);
        var input = actions.form('#resend');
        $.ajax({
            type: 'POST',
            url: '/api/signup/resend',
            data: input,
            error: actions.failed,
            success: (res) => {
                $('#resend :submit').prop('disabled', false);
                if (res.message === 'required' || res.message === 'email') {
                    $('input[name=email]').addClass('is-invalid');
                } else if (res.message === 'captcha') {
                    $('input[name=captcha]').addClass('is-invalid');
                }
                $('#' + res.message).removeClass('d-none');
                if (res.message === 'sent') {
                    actions.redirect('/signup/confirm/');
                }
                $('#captcha').attr("src", "/api/captcha?" + Math.random());
            }
        });
    });
}
$(document).ready(function () {
    login.check();
});
$.ajaxSetup({
    beforeSend: loader.show,
    complete: loader.hide
});