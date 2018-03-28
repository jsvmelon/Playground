define(['initCanvas','getOscillatorSourceNode','getMicSourceNode','d3','d3fc'],
function(initCanvas, getOscillatorSourceNode, getMicSourceNode, d3, fc) {
    return {
        playFile: function(canvas,audioContext) {
            var margin = {
                left: 50,
                right: 30,
                top: 10,
                bottom: 10
            }
                
            var sampleRate = audioContext.sampleRate,
                fMin = 0,
                fMax = 1200, //sampleRate / 4;
                fftBinCount = Math.pow(2,13), // must be a power of 2
                // bufferSize and fMax * 2 define the duration of an fft: fMax*2 / bufferSize in seconds
                bufferSize = fftBinCount * 2, 
                height = window.innerHeight,
                width = window.innerWidth,
                drawHeight = height - margin.top - margin.bottom,
                drawWidth = width - margin.left - margin.right,
                fBin = sampleRate / fftBinCount / 2, // frequency range per bin
                numberOfRelevantBins = Math.ceil(fMax / fBin);
                //fftBinCount = Math.pow(2,Math.floor(Math.log2(drawHeight)));

            canvas.width = width+1;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            var once = false;

            // setting up coordinates etc.
            initCanvas.init(ctx,margin,fMax,width,height);
                
            // this is the html tag referencing the mp3 track
            var myAudio = document.querySelector('audio');

            var sourceNodeFile = audioContext.createMediaElementSource(myAudio);
            var analyseFile = audioContext.createAnalyser();
            analyseFile.smoothingTimeConstant = 0;
            
            // the frequency bin count of the fft is half the buffer size
            // this defines the resolution of the frequency analysis:
            // one bucket has a width of (sample rate / 2) / frequency bin count
            analyseFile.fftSize = fftBinCount * 2;
            
            // get the microphone - once the user agreed draw will be called in the promise
            var analyseMic = audioContext.createAnalyser();
            analyseMic.fftSize = fftBinCount * 2;
            getMicSourceNode.create(audioContext,analyseMic,connectFile,draw,bufferSize/sampleRate);

            function connectFile() {
                sourceNodeFile.connect(analyseFile);
                analyseFile.connect(audioContext.destination);
                myAudio.load();
            }

            // frequency for a bin: f_bin = sampleRate * (bin / fftBinCount)
            // y-position is: drawHeight / sampleRate * f_bin
            function getYforBin(bin) {
                let fBin = sampleRate /2 * (bin / fftBinCount); // frequency this bin represents
                let y = drawHeight / fMax * fBin;
                return height - y - margin.bottom - 2;
            }

            function getLowerThreshold(data) {
                // find out which are the x strongest dB measurements
                let dataCopy = data.filter(function(value,index){
                    return index < numberOfRelevantBins;
                }); 

                dataCopy.sort();

                //var uva = Math.floor(fftBinCount / 200);
                let uva = 2; // sets the number of datapoints considered to determine the threshold
                let max = dataCopy[dataCopy.length-1];
                let ltuv = dataCopy[dataCopy.length-uva];
                let upperRange = max - ltuv;

                return facts = {
                    ltuv, 
                    upperRange
                }
            }

            function draw() {        
                if (!once) {
                    printParameters();
                    once = true;
                }

                // scroll to the left by one pixel
                let image = ctx.getImageData(
                    margin.left+2,
                    margin.top,
                    width-margin.left-margin.right,
                    height-margin.top-margin.bottom-2);
                ctx.putImageData(image,margin.left+1,margin.top);

                drawData(analyseFile,'255,0,0');
                drawData(analyseMic,'0,255,0');

                // call requestAnimationFrame again for the next frame (60 fps)
                //window.requestAnimationFrame(draw);
            }

            function drawData(analyser,color) {
                let data = new Float32Array(fftBinCount);
                analyser.getFloatFrequencyData(data);

                let facts = getLowerThreshold(data);

                for (var i = 0; i < fftBinCount ; i++) {                    
                    
                    if (i * fBin > fMax) return;

                    if (data[i] > analyser.minDecibels && data[i] >= facts.ltuv) {
                        let strength = (data[i]-facts.ltuv)/facts.upperRange;                
                        ctx.fillStyle = 'rgb(' + color + ',' + strength + ')';
                        ctx.fillRect(width-margin.right-1,getYforBin(i),1,1);
                    }
                }
            }

            function printParameters() {
                console.log("Number of bins: " + fftBinCount);
                console.log("pixelheight:" + drawHeight);                    
                console.log(getYforBin(1) - getYforBin(0));
                console.log("getYforBin(0):" + getYforBin(0));
                console.log("getYforBin(1):" + getYforBin(1));
                console.log("getYforBin(fftBinCount-1):" + getYforBin(fftBinCount-1))
                console.log("frequency resolution:" + (sampleRate / 2) / fftBinCount + " Hz");
            }
            var data = fc.randomFinancial()(50);

        }
    }
});
