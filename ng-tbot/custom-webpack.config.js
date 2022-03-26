const path = require('path');


module.exports = {
    output: {
        path: require('path').resolve('../../backend/staticfiles/angular-dist-dev'),
        filename: "[name].js"
    }
};
