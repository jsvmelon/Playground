
requirejs(["RecordRTC", "d3"], function(RecordRTC, d3) {

    console.log("first line ...")
    
    var margin = {
        left: 50,
        right: 30,
        top: 10,
        bottom: 10
    }
    // note: the sample rate defines the frequency covered by fft: from 0 to sample rate / 2
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
    var sampleRate = audioContext.sampleRate,
        fMin = 0,
        fMax = sampleRate / 4,        
        fftBinCount = 2048, // must be a power of 2
        // bufferSize and fMax * 2 define the duration of an fft: fMax*2 / bufferSize in seconds
        bufferSize = fftBinCount * 2, 
        height = window.innerHeight,
        width = window.innerWidth,
        drawHeight = height - margin.top - margin.bottom,
        drawWidth = width - margin.left - margin.right;
        //fftBinCount = Math.pow(2,Math.floor(Math.log2(drawHeight)));
        console.log('drawHeight: ' + drawHeight);
        console.log('fftBinCount: ' + fftBinCount);

    
    // this is the html tag referencing the mp3 track
    var myAudio = document.querySelector('audio');
    var sourceNodeFile = audioContext.createMediaElementSource(myAudio);
    var analyseMp3 = audioContext.createAnalyser();
    analyseMp3.fftSize = fftBinCount * 2;

    // the frequency bin count of the fft is half the buffer size
    // this defines the resolution of the frequency analysis:
    // one bucket has a width of (sample rate / 2) / frequency bin count
    const fftData = new Float32Array(fftBinCount);
    sourceNodeFile.connect(analyseMp3);

    /*
    var oscilSource = audioContext.createOscillator();
    oscilSource.type = "sine";
    oscilSource.frequency.setValueAtTime(10000, audioContext.currentTime); // value in hertz
    oscilSource.connect(analyseMp3);
    oscilSource.start();
    */
    // this is capturing from a microphone
    var constraints = {
        audio: true,
        video: false
    };
    var recordRTC = null;

    navigator.mediaDevices.getUserMedia(constraints).
    then(function(mediaStream) {
        // here I can use the stream 
        console.log("entering promise")

        // this is a source node for the mic
        var sourceNodeMic = audioContext.createMediaStreamSource(mediaStream);
        //sourceNodeMic.connect(analyseMp3);
    })
    .catch(function(err) {
        console.log(err)
    });

    analyseMp3.connect(audioContext.destination);

    var canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    window.requestAnimationFrame(init);

    // setting up coordinates etc.
    function init(timestamp) {
        ctx.lineWidth = 1;
        ctx.moveTo(margin.left,margin.top); 
        ctx.lineTo(margin.left,height-margin.bottom);        // y-axis line
        ctx.lineTo(width-margin.right,height-margin.bottom); // x-axis line

        var tickDistance = 20;
        ctx.font = "10px Arial";
        for (var y = tickDistance; y <= drawHeight; y += tickDistance) {
            ctx.moveTo(margin.left,height - y - margin.bottom);
            ctx.lineTo(margin.left-5,height - y - margin.bottom);
            var prop = y / drawHeight;
            ctx.fillText(Math.round(prop * (fMax)) + " Hz",0,height - y - margin.bottom + 2);
        }
        ctx.stroke();

        window.requestAnimationFrame(draw);
    }

    // frequency for a bin: f_bin = sampleRate * (bin / fftBinCount)
    // y-position is: drawHeight / sampleRate * f_bin
    function getYforBin(bin) {
        var fBin = sampleRate /2 * (bin / fftBinCount);
        var y = drawHeight / fMax * fBin;
        return height - y - margin.bottom - 2;
    }

    function draw(timestamp) {        
        setTimeout(draw, bufferSize/sampleRate * 1000);

        const data = new Float32Array(fftBinCount);
        //analyseMp3.getByteFrequencyData(data);
        analyseMp3.getFloatFrequencyData(data);

        var image = ctx.getImageData(margin.left+2,margin.top,width-margin.left-margin.right,height-margin.top-margin.bottom-2);
        ctx.putImageData(image,margin.left+1,margin.top);

        dataCopy = data.map(function(x){return x}); 
        dataCopy.sort();
        var uva = Math.floor(fftBinCount / 500);
        var min = dataCopy[0];
        var max = dataCopy[fftBinCount-1];
        var ltuv = dataCopy[fftBinCount-uva];

        data.map(function(currentValue,index){
            if (currentValue >= ltuv) {
                //ctx.fillStyle = 'rgb(255,0,0,' + (data[bin]/range) + ')';
                ctx.fillStyle = 'rgb(255,0,0)';
                ctx.fillRect(width-margin.right-1,getYforBin(index),1,1);
            }
        });
        // call requestAnimationFrame again for the next frame (60 fps)
        //window.requestAnimationFrame(draw);
    }
});