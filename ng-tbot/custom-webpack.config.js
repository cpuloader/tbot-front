const path = require('path');


module.exports = {
    plugins:[
        new BundleTracker({filename: '../../backend/webpack-stats.json'})
    ],
    output: {
        path: require('path').resolve('../../backend/staticfiles/angular-dist-dev'),
        filename: "[name].js"
    }
};
