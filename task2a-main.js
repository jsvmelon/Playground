var task2 = require('./task2.js')
var fs = require('fs')

function formatResult(caption, result) {
    return caption + '\n' +
        'Percentage: ' + result.percentage + '\n' +
        'Date:       ' + result.date
}

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

    console.log(formatResult('Min:', res.min))
    console.log(formatResult('Max:', res.max))

    if (verbose === true) {
        console.log('Errors:\n' + res.errors)
    }
});
