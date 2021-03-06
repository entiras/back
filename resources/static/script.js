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
    jumbo: (src) => {
        const i = new Image();
        i.onload = (e) => {
            var src = e.path[0].src;
            $('.jumbotron').css('background-image', 'url(' + src + ')');
        };
        i.src = src;
    },
    captcha: () => {
        $(':submit').prop('disabled', true);
        const i = $('#_captcha')[0];
        i.onload = (e) => {
            $(':submit').prop('disabled', false);
        };
        i.src = '/api/captcha?' + Math.random();
    },
    redirect: (route) => {
        setTimeout((destiny) => {
            window.location.href = destiny;
        }, 500, route);
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
        $('#' + data.message + '-' + data.field).removeClass('d-none');
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
            if (login.type === 'success') {
                util.redirect('/')
            }
        },
        logout: async (e) => {
            e.preventDefault();
            const form = await util.form('#logout');
            await $.ajax({
                type: 'POST',
                url: '/api/logout',
                data: form
            });
            util.redirect('/')
        }
    },
    signup: {
        main: async (e) => {
            e.preventDefault();
            util.unalert();
            const form = await util.form('#signup');
            const signup = await $.ajax({
                type: 'POST',
                url: '/api/signup',
                data: form
            });
            util.alert(signup);
            if (signup.type === 'success') {
                util.redirect('/signup/confirm')
            }
        },
        confirm: async (e) => {
            e.preventDefault();
            util.unalert();
            const form = await util.form('#signup-confirm');
            const confirm = await $.ajax({
                type: 'POST',
                url: '/api/signup/confirm',
                data: form
            });
            util.alert(confirm);
            if (confirm.type === 'success') {
                util.redirect('/login')
            }
        },
        resend: async (e) => {
            e.preventDefault();
            util.unalert();
            const form = await util.form('#signup-resend');
            const resend = await $.ajax({
                type: 'POST',
                url: '/api/signup/resend',
                data: form
            });
            util.alert(resend);
            if (resend.type === 'success') {
                util.redirect('/signup/confirm')
            } else {
                util.captcha();
            }
        }
    }
};
const page = {
    label: undefined,
    init: () => {
        $(':submit').prop('disabled', false);
        $('#logout-btn').click(act.login.logout);
        page.label = $("meta[name=label]").attr("content");
        if (page.label) {
            console.log(page.label);
            page[page.label]();
        }
    },
    error: () => {
        util.redirect('/');
    },
    home: () => {
        util.jumbo('https://i.imgur.com/duUZ0Tp.jpg');
    },
    login: () => {
        $('#login').on('submit', act.login.main);
        util.jumbo('https://i.imgur.com/ZiLd6zZ.jpg');
    },
    login_forgot: () => {
        $('#login-forgot').on('submit', act.login.forgot);
        util.jumbo('https://i.imgur.com/ZiLd6zZ.jpg');
    },
    signup: () => {
        $('#signup').on('submit', act.signup.main);
        util.jumbo('https://i.imgur.com/ZiLd6zZ.jpg');
    },
    signup_confirm: () => {
        $('#signup-confirm').on('submit', act.signup.confirm);
        util.jumbo('https://i.imgur.com/ZiLd6zZ.jpg');
    },
    signup_resend: () => {
        $('#signup-resend').on('submit', act.signup.resend);
        util.jumbo('https://i.imgur.com/ZiLd6zZ.jpg');
        util.captcha();
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