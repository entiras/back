actions.signup = function (data) {
    if (typeof data !== 'object') {
        actions.csrf(actions.signup);
    } else if (typeof data.token === 'string') {
        $('input[name=_csrf]').val(data.token);
        var arr = $('#signup-form').serializeArray();
        var data = {};
        for (var i = 0; i < arr.length; i++) {
            data[arr[i].name] = arr[i].value;
        }
        $.ajax({
            type: 'POST',
            url: '/api/signup',
            data: data,
            success: actions.signup,
            error: actions.failed
        });
    } else {
        console.log(data);
    }
};