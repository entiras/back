'use strict'

class TestController {
    test({ response }) {
        return response.json({
            date: new Date().toISOString()
        });
    }
}

module.exports = PageController