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
    if (cookie === udefined) {
        login.logged = false;
    } else {
        login.logged = true;
    }
    login.checked();
};
login.checked = function () {
    loader.hide();
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
        console.log(data);
    }
};
$(document).ready(function () {
    loader.show();
    login.check();
});