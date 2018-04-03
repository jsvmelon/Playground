define(['getOscillatorSourceNode','getMicSourceNode','d3','d3fc'],
function(getOscillatorSourceNode, getMicSourceNode, d3, fc) {
    return {
        playFile: function(audioContext) {
            var margin = {
                left: 50,
                right: 30,
                top: 10,
                bottom: 10
            }

            var d3Data = [];
            var radius = 2;

            var sampleRate = audioContext.sampleRate,
                fMin = 0,
                fMax = 1200, //sampleRate / 4;
                fftBinCount = Math.pow(2,13), // must be a power of 2
                // bufferSize and fMax * 2 define the duration of an fft: fMax*2 / bufferSize in seconds
                bufferSize = fftBinCount * 2, 
                height = window.innerHeight-150,
                width = window.innerWidth,
                drawHeight = height - margin.top - margin.bottom,
                drawWidth = width - margin.left - margin.right,
                fBin = sampleRate / fftBinCount / 2, // frequency range per bin
                numberOfRelevantBins = Math.ceil(fMax / fBin);
                //fftBinCount = Math.pow(2,Math.floor(Math.log2(drawHeight)));

            var yScaleHz = d3.scaleLinear()
                .domain([0,fMax])
                .range([drawHeight,0]);            

            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            // add the y-axis
            svg.append("g").call(d3.axisLeft(yScaleHz));

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
            getMicSourceNode.create(audioContext,analyseMic,connectFile,draw,bufferSize/sampleRate*1000);

            function connectFile() {
                sourceNodeFile.connect(analyseFile);
                analyseFile.connect(audioContext.destination);
                myAudio.load();
            }

            // frequency for a bin: f_bin = sampleRate * (bin / fftBinCount)
            function getFrequency(bin) {
                return sampleRate /2 * (bin / fftBinCount);
            }

            // find out which are the x strongest dB measurements
            function getLowerThreshold(data) {
                let dataCopy = data.filter(function(value,index){
                    return index < numberOfRelevantBins;
                }); 

                dataCopy.sort();

                //var uva = Math.floor(fftBinCount / 200);
                let uva = 1; // sets the number of datapoints considered to determine the threshold
                let max = dataCopy[dataCopy.length-1];
                let ltuv = dataCopy[dataCopy.length-uva];
                let upperRange = max - ltuv;

                return facts = {
                    ltuv, 
                    upperRange
                }
            }

            function draw() {        
                displayData(analyseFile, '0,0,255');
                displayData(analyseMic, '0,255,0');
            }

            function displayData(analyser, color) {
                let data = new Float32Array(fftBinCount);
                analyser.getFloatFrequencyData(data);

                let facts = getLowerThreshold(data);

                // modify x coordinate of existing data points to scroll
                d3Data = d3Data.map(function(d){
                    d.x = d.x - (radius);
                    return d;
                })

                // remove data that is too far left
                d3Data = d3Data.filter(function(d){ 
                    if (d.x > 0) return true; 
                    else return false;
                });

                // adding data
                for (var i = 0; i < fftBinCount ; i++) {                    
                    if (i * fBin > fMax) break;

                    if (data[i] > analyser.minDecibels && data[i] >= facts.ltuv) {
                        let newKey;
                        if (d3Data.length === 0) newKey = 0;
                        else newKey = d3Data[d3Data.length-1].key + 1;
                        d3Data.push({
                                x: width-margin.right-margin.left-1,
                                y: yScaleHz(getFrequency(i)),
                                key: newKey,
                                signal: data[i]
                        });
                    }
                }

                let selections = svg.selectAll(".dot")
                .data(d3Data, function(d){ return d.key; });

                selections
                .attr("cx", function(d){ return d.x; });        // update existing
                
                selections
                .enter().append("circle")                       // adding new
                .attr("class", "dot")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d) {
                    let strength = (d.signal-facts.ltuv)/facts.upperRange;                
                    return 'rgb(' + color + ')'; 
                });
                
                selections
                .exit().remove();                               // remove 
            }
        }
    }
});
