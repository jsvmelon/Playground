var task2 = require('./task2.js')
var xhr = require('xhr2')
var verbose = false

// default values - can be overriden by commandline parameters
var start = '2010-01-01'
var end = '2014-12-31'
var period = 1
var api = 'byQHh5K2zT4MKss4ztMG'
var dataset = 'AAPL'

process.argv.forEach(function(value, index, array) {
    if (index < 2) { return }

    if (value === '-v') {
        verbose = true
    } else if (value.substring(0, 7) === '-start=') {
        start = value.substring(7)
    } else if (value.substring(0, 5) === '-end=') {
        end = value.substring(5)
    } else if (value.substring(0, 8) === '-period=') {
        period = Number(value.substring(8))
    } else if (value.substring(0, 9) === '-api_key=') {
        api = value.substring(9)
    } else if (value.substring(0, 9) === '-dataset=') {
        dataset = value.substring(9)
    } else {
        console.log('unrecognised parameter \'' + value + '\'')
    }
})

function getData() {
    var request = new xhr.XMLHttpRequest()

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var res = task2.findMinMax(request.responseText, period)

            console.log(task2.formatResult('Min:', res.min))
            console.log(task2.formatResult('Max:', res.max))

            if (verbose === true) {
                console.log('Errors:\n' + res.errors)
            }
        }
    }

    var url = 'https://www.quandl.com/api/v3/datasets/WIKI/' + dataset + '.json?api_key=' + api + '&start_date=' + start + '&end_date=' + end
    console.log(url)

    request.open('GET', url, true)
    request.send()
}

getData()
