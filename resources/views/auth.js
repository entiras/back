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
// show content depending on log
var content = {};
content.logged = function () {
    loader.hide();
    $('.logged').removeClass('d-none');
};
content.guest = function () {
    loader.hide();
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
$(document).ready(function () {
    loader.show();
    login.check();
});