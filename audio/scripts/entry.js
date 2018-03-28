define(["play","d3","d3fc"], function(play,d3,fc) {
    test();

    var fileElement = document.getElementById('file');
    fileElement.addEventListener('change',triggerPlay);

    var audiosrc = document.getElementById('src');
    audiosrc.src = '';

    function triggerPlay() {
        var canvas = document.getElementById("canvas");
        var files = fileElement.files;

        if (files.length > 0) { // we are only interested in the first file - no multiselect here            
            audiosrc.src = files[0].name;
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            play.playFile(canvas,audioContext);
        }
    }

    function test() {
        var data = fc.randomFinancial()(50);
    
        var yExtent = fc.extentLinear()
        .accessors([
            function(d) { return d.high; },
            function(d) { return d.low; }
        ]);
    
        var xExtent = fc.extentDate()
        .accessors([function(d) { return d.date; }]);
    
        var gridlines = fc.annotationSvgGridline();
        var candlestick = fc.seriesSvgCandlestick();
        var multi = fc.seriesSvgMulti()
            .series([gridlines, candlestick]);
    
        var chart = fc.chartSvgCartesian(
            fc.scaleDiscontinuous(d3.scaleTime()),
            d3.scaleLinear()
        )
        .yDomain(yExtent(data))
        .xDomain(xExtent(data))
        .plotArea(multi);
    
        d3.select('#chart')
        .datum(data)
        .call(chart);
    }
});

