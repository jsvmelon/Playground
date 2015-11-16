var task2 = require('../task2.js')

describe('testing constructResult', function() {
    it('constructs a min/max result including corresponding dates', function() {
        var date1 = new Date()
        var date2 = new Date('2015-05-11')
        var percentage = 0.33
        var res = task2.constructResult(date1, date2, percentage)
        expect(res.oldDate).toBe(date1)
        expect(res.date).toBe(date2)
        expect(res.percentage).toBe(percentage)

        // some negative tests
        res = task2.constructResult()
        expect(res.oldDate).toBeUndefined()
        expect(res.date).toBeUndefined()
        expect(res.percentage).toBe(undefined)
    })
})
