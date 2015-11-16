var task2 = require('./task2.js')
var fs = require('fs')
var verbose = false

process.argv.forEach(function(value, index, array) {
    if (index < 2) { return }

    if (value === '-v') {
        verbose = true
    } else {
        console.log('unrecognised parameter \'' + value + '\'')
    }
})

fs.readFile('C:/Users/jmelon/Documents/man-training/AAPL.json', 'utf8', function(err, data) {
    if (err) {
        return console.log(err)
    }

    var res = task2.findMinMax(data);

    console.log(task2.formatResult('Min:', res.min))
    console.log(task2.formatResult('Max:', res.max))

    if (verbose === true) {
        console.log('Errors:\n' + res.errors)
    }
});
