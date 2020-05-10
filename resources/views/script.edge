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
    $.ajax({
        type: 'GET',
        url: '/api',
        success: login.checked,
        error: actions.failed
    });
};
login.checked = function () {
    if (login.logged) {
        content.logged();
    } else {
        content.guest();
    }
};
// show content depending on log and view
var content = {};
content.logged = function () {
    loader.hide();
    $('.logged').removeClass('d-none');
};
content.guest = function () {
    loader.hide();
    $('.guest').removeClass('d-none');
};
content.view = function () {
    var url = new URL(window.location.href);
    var route = url.pathname;
    $('title').append(' - ');
    switch (route) {
        case '/':
            $('#home').removeClass('d-none');
            $('title').append('Raíz');
            break;
        case '/signup':
            $('#signup').removeClass('d-none');
            $('title').append('Registro');
            break;
        case '/login':
            $('#login').removeClass('d-none');
            $('title').append('Entrar');
            break;
        default:
            $('#notfound').removeClass('d-none');
            $('title').append('Error');
    }
}
// actions
var actions = {};
actions.failed = function () {
    loader.hide();
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
actions.signup = function (data, stat, req) {
    if (typeof data !== 'object') {
        actions.csrf(actions.signup);
    } else if (typeof data.token === 'string') {
        $('input[name=_csrf]').val(data.token);
        var arr = $('#signup-form').serializeArray();
        $.ajax({
            type: 'POST',
            url: '/api/signup',
            data: {
                _csrf: arr[0].value
            },
            success: actions.signup,
            error: actions.failed
        });
    } else {
        console.log(data);
    }
};
$(document).ready(function () {
    loader.show();
    login.check();
    content.view();
});