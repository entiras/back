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
// show content depending on log
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
actions.signup = function (data) {
    $('#signup-btn').prop('disabled', true);
    $('.alert').addClass('d-none');
    $('input').removeClass('is-invalid');
    if (typeof data !== 'object') {
        actions.csrf(actions.signup);
    } else if (typeof data.token === 'string') {
        $('input[name=_csrf]').val(data.token);
        var data = actions.form('#signup-form');
        $.ajax({
            type: 'POST',
            url: '/api/signup',
            data: data,
            success: actions.signup,
            error: actions.failed
        });
    } else {
        $('#signup-btn').prop('disabled', false);
        if (data.message === 'validation') {
            var field = data.error.field;
            var val = data.error.validation;
            $('#' + field + '-' + val).removeClass('d-none');
            $('input[name=' + field + ']').addClass('is-invalid');
        } else if (data.message === 'url') {
            $('#username-url').removeClass('d-none');
            $('input[name=username]').addClass('is-invalid');
        } else if (data.message === 'clone') {
            $('#clone').removeClass('d-none');
            $('input[name=username]').addClass('is-invalid');
            $('input[name=email]').addClass('is-invalid');
        } else if (data.message === 'sent') {
            $('#sent').removeClass('d-none');
        }
    }
};
actions.confirm = function () {
    $('input[name=token]').val(window.location.search);
}
$(document).ready(function () {
    login.check();
    if ($('input[name=token]').val()) {
        signup.confirm()
    }
});
$.ajaxSetup({
    beforeSend: loader.show,
    complete: loader.hide
});