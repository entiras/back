const session = {
    user: undefined,
    init: () => {
        session.user = Cookies.get('user');
        if (session.user) {
            $('#username').text(session.user);
            $('.logged').removeClass('d-none');
        } else {
            $('.guest').removeClass('d-none');
        }
    }
};
const util = {
    img: {
        load: async (src) => {
            await new Promise((s, e) => {
                const i = new Image();
                i.onload = s;
                i.onerror = e;
                i.src = src;
            });
            $('.jumbotron').css('background-image', 'url(' + src + ')');
        }
    },
    form: async (id) => {
        await act.csrf();
        var arr = $(id).serializeArray();
        var data = {};
        for (var i = 0; i < arr.length; i++) {
            data[arr[i].name] = arr[i].value;
        }
        return data;
    },
    alert: (data) => {
        $('#form-alert').addClass('alert-' + data.type);
        $('#form-alert').removeClass('d-none');
        $('#form-alert span').addClass('d-none');
        $('#' + data.message + '-' + data.field).addClass('d-none');
        $('input[name=' + data.field + ']').addClass('is-invalid');
    },
    unalert: () => {
        $('#form-alert').removeClass('alert-danger');
        $('#form-alert').removeClass('alert-success');
        $('#form-alert').addClass('d-none');
        $('input').removeClass('is-invalid');
    }
};
const act = {
    fail: () => {
        $('#network-err').removeClass('d-none');
        $(':submit').prop('disabled', false);
    },
    wait: () => {
        $('#loader').removeClass('d-none');
        $(':submit').prop('disabled', true);
    },
    end: () => {
        $('#loader').addClass('d-none');
        $(':submit').prop('disabled', false);
    },
    csrf: async () => {
        const csrf = await $.ajax({
            type: 'GET',
            url: '/api/csrf'
        });
        $('input[name=_csrf]').val(csrf.token);
    },
    login: {
        main: async (e) => {
            e.preventDefault();
            util.unalert();
            const form = await util.form('#login');
            const login = await $.ajax({
                type: 'POST',
                url: '/api/login',
                data: form
            });
            util.alert(login);
            console.log(login);
        }
    }
};
const page = {
    label: undefined,
    init: () => {
        $(':submit').prop('disabled', false);
        page.label = $("meta[name=label]").attr("content");
        if (page.label) {
            console.log(page.label);
            page[page.label]();
        }
    },
    home: async () => {
        await util.img.load('https://i.imgur.com/duUZ0Tp.jpg');
    },
    login: async () => {
        $('#login').on('submit', act.login.main);
        await util.img.load('https://i.imgur.com/ZiLd6zZ.jpg');
    }
};
$(document).ready(() => {
    session.init();
    page.init();
});
$.ajaxSetup({
    beforeSend: act.wait,
    complete: act.end,
    error: act.fail
});

// var loader = {};
// loader.active = false;
// loader.show = function () {
//     loader.active = true;
//     setTimeout(loader.wait, 500);
// };
// loader.hide = function () {
//     loader.active = false;
//     $('#loader').addClass('d-none');
// };
// loader.wait = function () {
//     if (loader.active) {
//         $('#loader').removeClass('d-none');
//     }
// }
// var login = {};
// login.logged = false;
// login.check = function () {
//     var cookie = Cookies.get('user');
//     if (cookie === undefined) {
//         login.logged = false;
//     } else {
//         login.logged = true;
//         $('#username').text(cookie);
//     }
//     login.checked();
// };
// login.checked = function () {
//     if (login.logged) {
//         content.logged();
//     } else {
//         content.guest();
//     }
// };
// var content = {};
// content.logged = function () {
//     $('.logged').removeClass('d-none');
// };
// content.guest = function () {
//     $('.guest').removeClass('d-none');
// };
// var actions = {};
// actions.show = (e) => {
//     $(e.target).removeClass('d-none');
// }
// actions.failed = function () {
//     $('#network-err').removeClass('d-none');
// };
// actions.csrf = function (callback) {
//     $.ajax({
//         type: 'GET',
//         url: '/api/csrf',
//         success: callback,
//         error: actions.failed
//     });
// };
// actions.form = function (id) {
//     var arr = $(id).serializeArray();
//     var data = {};
//     for (var i = 0; i < arr.length; i++) {
//         data[arr[i].name] = arr[i].value;
//     }
//     return data;
// };
// actions.redirect = function (route) {
//     setTimeout((destiny) => {
//         window.location.href = destiny;
//     }, 500, route);
// }
// actions.logout = function () {
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#logout');
//         $.ajax({
//             type: 'POST',
//             url: '/api/logout',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 actions.redirect('/');
//             }
//         });
//     });
// };
// actions.login = function (event) {
//     event.preventDefault();
//     $('#login :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#login');
//         $.ajax({
//             type: 'POST',
//             url: '/api/login',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#login :submit').prop('disabled', false);
//                 if (res.message === 'validation') {
//                     var field = res.error.field;
//                     var val = res.error.validation;
//                     $('#' + field + '-' + val).removeClass('d-none');
//                     $('input[name=' + field + ']').addClass('is-invalid');
//                 } else if (res.message === 'credentials') {
//                     $('#credentials').removeClass('d-none');
//                     $('input[name=username]').addClass('is-invalid');
//                     $('input[name=password]').addClass('is-invalid');
//                 } else if (res.message === 'unconfirmed') {
//                     $('#unconfirmed').removeClass('d-none');
//                 } else if (res.message === 'logged') {
//                     $('#logged').removeClass('d-none');
//                     actions.redirect('/');
//                 }
//             }
//         });
//     });
// };
// actions.signup = function (event) {
//     event.preventDefault();
//     $('#signup :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#signup');
//         $.ajax({
//             type: 'POST',
//             url: '/api/signup',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#signup :submit').prop('disabled', false);
//                 if (res.message === 'validation') {
//                     var field = res.error.field;
//                     var val = res.error.validation;
//                     $('#' + field + '-' + val).removeClass('d-none');
//                     $('input[name=' + field + ']').addClass('is-invalid');
//                 } else if (res.message === 'url') {
//                     $('#username-url').removeClass('d-none');
//                     $('input[name=username]').addClass('is-invalid');
//                 } else if (res.message === 'clone') {
//                     $('#clone').removeClass('d-none');
//                     $('input[name=username]').addClass('is-invalid');
//                     $('input[name=email]').addClass('is-invalid');
//                 } else if (res.message === 'sent') {
//                     $('#sent').removeClass('d-none');
//                     actions.redirect('/signup/confirm/');
//                 }
//             }
//         });
//     });
// };
// actions.confirm = function (event) {
//     event.preventDefault();
//     $('#confirm :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#confirm');
//         $.ajax({
//             type: 'POST',
//             url: '/api/signup/confirm',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#confirm :submit').prop('disabled', false);
//                 if (res.type === 'danger') {
//                     $('input[name=token]').addClass('is-invalid');
//                 } else {
//                     actions.redirect('/login/');
//                 }
//                 $('#' + res.message).removeClass('d-none');
//             }
//         });
//     });
// }
// actions.resend = function (event) {
//     event.preventDefault();
//     $('#resend :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#resend');
//         $.ajax({
//             type: 'POST',
//             url: '/api/signup/resend',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#resend :submit').prop('disabled', false);
//                 if (res.message === 'required' || res.message === 'email') {
//                     $('input[name=email]').addClass('is-invalid');
//                 } else if (res.message === 'captcha') {
//                     $('input[name=captcha]').addClass('is-invalid');
//                 }
//                 $('#' + res.message).removeClass('d-none');
//                 if (res.message === 'sent') {
//                     actions.redirect('/signup/confirm/');
//                 }
//                 if (res.message !== 'sent') {
//                     $('#_captcha').attr("src", "/api/captcha?" + Math.random());
//                 }
//             }
//         });
//     });
// }
// actions.forgot = function (event) {
//     event.preventDefault();
//     $('#forgot :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#forgot');
//         $.ajax({
//             type: 'POST',
//             url: '/api/login/forgot',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#forgot :submit').prop('disabled', false);
//                 if (res.message === 'required' || res.message === 'email') {
//                     $('input[name=email]').addClass('is-invalid');
//                 } else if (res.message === 'captcha') {
//                     $('input[name=captcha]').addClass('is-invalid');
//                 }
//                 $('#' + res.message).removeClass('d-none');
//                 if (res.message === 'sent') {
//                     actions.redirect('/login/reset/');
//                 }
//                 if (res.message !== 'sent') {
//                     $('#_captcha').attr("src", "/api/captcha?" + Math.random());
//                 }
//             }
//         });
//     });
// }
// actions.reset = function (event) {
//     event.preventDefault();
//     $('#reset :submit').prop('disabled', true);
//     $('.alert').addClass('d-none');
//     $('input').removeClass('is-invalid');
//     actions.csrf((data) => {
//         $('input[name=_csrf]').val(data.token);
//         var input = actions.form('#reset');
//         console.log(input);
//         $.ajax({
//             type: 'POST',
//             url: '/api/login/reset',
//             data: input,
//             error: actions.failed,
//             success: (res) => {
//                 $('#reset :submit').prop('disabled', false);
//                 if (res.type !== 'danger') {
//                     actions.redirect('/login/');
//                 }
//                 if (res.message === 'required' || res.message === 'min') {
//                     $('input[name=password]').addClass('is-invalid');
//                 } else if (res.message === 'invalid') {
//                     $('input[name=token]').addClass('is-invalid');
//                 }
//                 $('#' + res.message).removeClass('d-none');
//             }
//         });
//     });
// }