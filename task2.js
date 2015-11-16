var fs = require('fs')

function formatResult(caption, result) {
    return caption + '\n' +
        'Percentage: ' + result.percentage + '\n' +
        'Date:       ' + result.date +
        'Preceding   ' + result.oldDate
}

exports.formatResult = formatResult

function constructResult(oldDate, newDate, percentage) {
    return {
        oldDate: oldDate,
        date: newDate,
        percentage: percentage
    }
}

exports.constructResult = constructResult

function findMinMax(data, period) {
    if (period === undefined) {
        period = 7
    }

    var jsonObj = JSON.parse(data)

    // the jsonObj is an array of an array - so the value is an array again
    var structuredArray = jsonObj.dataset.data.map(function(value, index) {
        return {
            date: new Date(value[0]),
            value: value[11]
        }
    }).reverse();

    var max, min
    var errors = ''

    structuredArray.forEach(function(entry, index, d) {
        if (index > (period - 1)) {
            var startindex = index - 1

            while (startindex >= 0 && startindex > index - period && d[startindex] !== undefined) {

                var diff = Math.round((entry.date - d[startindex].date) / (1000 * 3600 * 24), 0)

                if (diff === period) {
                    var percentage = (entry.value / d[startindex].value) - 1
                    if (max === undefined || percentage > max.percentage) {
                        max = constructResult(d[startindex].date, entry.date, percentage)
                    }

                    if (min === undefined || percentage < min.percentage) {
                        min = constructResult(d[startindex].date, entry.date, percentage)
                    }

                    return
                } else if (diff > period) {
                    // due to bank holidays the 7-day difference is not always defined
                    errors = errors + 'There is no 7 day difference in the data for date: ' + entry.date + '\n'
                    return
                }
                startindex--
            }

            // if we arrive here there was an error
            errors = errors + '\nA generic error occurred'
        }
    })

    return {
        max: max,
        min: min,
        errors: errors
    }
}

exports.findMinMax = findMinMax
