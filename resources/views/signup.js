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