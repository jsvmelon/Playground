var task2 = require('./Quandl.js')
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

	var quandl = new task2.Quandl(data)

    var res = quandl.findMinMax();

    console.log(quandl.formatResult('Min:', res.min))
    console.log(quandl.formatResult('Max:', res.max))

    if (verbose === true) {
        console.log('Errors:\n' + res.errors)
    }
});
