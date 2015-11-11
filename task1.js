var fs = require('fs')

function constructResult(oldDate, newDate, percentage) {
    return {
        oldDate: oldDate,
        date: newDate,
        percentage: percentage
    }
}

fs.readFile('./AAPL.json', 'utf8', function(err, data) {
    if (err) {
        return console.log(err)
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

    structuredArray.forEach(function(entry, index, d) {
        if (index > 10) {
            var startindex = index - 1

            while (startindex > index - 10 && d[startindex] !== undefined) {
                var diff = Math.round((entry.date - d[startindex].date) / (1000 * 3600 * 24), 0)

                if (diff >= 7) {
                    var percentage = (entry.value / d[startindex].value) - 1
                    if (max === undefined || percentage > max.percentage) {
                        max = constructResult(d[startindex].date, entry.date, percentage)
                    }

                    if (min === undefined || percentage < min.percentage) {
                        min = constructResult(d[startindex].date, entry.date, percentage)
                    }

                    return
                }
                startindex--
            }

            // if we arrive here there was an error
            console.log('an error occurred')
        }
    })

    console.log('\nMax:\nDate = ' + max.date + '\nPercentage = ' + max.percentage + '\nOld Date = ' + max.oldDate + '\n')
    console.log('Min:\nDate = ' + min.date + '\nPercentage = ' + min.percentage + '\nOld Date = ' + min.oldDate)
})
