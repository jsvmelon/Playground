var task2 = require('./task2.js')
var xhr = require('xhr2')
var verbose = false

process.argv.forEach(function(value, index, array) {
    if (index < 2) { return }

    if (value === '-v') {
        verbose = true
    } else {
        console.log('unrecognised parameter \'' + value + '\'')
    }
})

function getData() {
    var request = new xhr.XMLHttpRequest()

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var res = task2.findMinMax(request.responseText)

            console.log(task2.formatResult('Min:', res.min))
            console.log(task2.formatResult('Max:', res.max))

            if (verbose === true) {
                console.log('Errors:\n' + res.errors)
            }
        }
    }

    request.open('GET', 'https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json?api_key=byQHh5K2zT4MKss4ztMG&start_date=2010-01-01&end_date=2014-12-31', true)
    request.send()
}

getData()
