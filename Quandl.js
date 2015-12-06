var fs = require('fs')

// this function is intended to be used as a constructor - it will throw an exception if used differently
function Quandl(data) {
    if (!(this instanceof Quandl)) {
        throw 'You must create an instance of Quandl with the new keyword'
    }

    var constructResult = function constructResult(oldDate, newDate, percentage) {
        return {
            oldDate: oldDate,
            date: newDate,
            percentage: percentage
        }
    }

    this.jsonObj = JSON.parse(data)

    this.formatResult = function formatResult(caption, result) {
        return caption + '\n' +
            'Percentage: ' + result.percentage + '\n' +
            'Date:       ' + result.date +
            'Preceding   ' + result.oldDate
    }

    this.findMinMax = function findMinMax(period) {
        if (period === undefined) {
            period = 7
        }
    
        // the jsonObj is an array of an array - so the parameter value is an array again
        var structuredArray = this.jsonObj.dataset.data.map(function(value, index) {
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
    
}

exports.Quandl = Quandl
