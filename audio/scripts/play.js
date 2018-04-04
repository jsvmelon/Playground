define(['musicalNotes','getOscillatorSourceNode','getMicSourceNode','d3','d3fc'],
function(musicalNotes, getOscillatorSourceNode, getMicSourceNode, d3, fc) {
    return {
        playFile: function(audioContext) {
            var margin = {
                left: 50,
                right: 80,
                top: 10,
                bottom: 10
            }

            var sampleRate = audioContext.sampleRate,
                fMin = 0,
                fMax = 1200, //sampleRate / 4;
                fftBinCount = Math.pow(2,13), // must be a power of 2
                // bufferSize and fMax * 2 define the duration of an fft: fMax*2 / bufferSize in seconds
                bufferSize = fftBinCount * 2,
                fBin = sampleRate / fftBinCount / 2, // frequency range per bin
                numberOfRelevantBins = Math.ceil(fMax / fBin);

            var height = window.innerHeight-150,
                width = window.innerWidth,
                drawHeight = height - margin.top - margin.bottom,
                drawWidth = width - margin.left - margin.right;

            var notesFrequency = musicalNotes.create();

            var d3Data = [];
            var radius = 1;

            var svg = d3.select("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

            var yScaleHz = d3.scaleLinear()
                .domain([0,fMax])
                .range([drawHeight,0]);
                
            // calculate postion values using yScaleHz
            notesFrequency.frequency.forEach(function(d,i){
                notesFrequency.position.push(yScaleHz(d));
            });

            var yScaleNote = d3.scaleOrdinal()
                .domain(notesFrequency.note)
                .range(notesFrequency.position);

            // add the y-axis
            var axisHz = d3.axisLeft(yScaleHz);
            svg.append("g")
            .attr("class","axisLeft")
            .call(axisHz);

            var axisNote = d3.axisRight(yScaleNote);
            svg.append("g")
            .attr("class","axisRight")
            .attr("transform", "translate( " + drawWidth + ", 0 )")
            .call(axisNote);

            // add a slider for the y-axis
            d3.select("#range")
            .attr("min",0)
            .attr("max",fMax);

            var rangeElement = document.getElementById('range');
            rangeElement.value = fMax;
            rangeElement.addEventListener('change', changeAxis);

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

            function changeAxis(event) {
                fMax = event.target.value;
                yScaleHz.domain([0, fMax]);

                d3.select(".axisLeft").transition().call(axisHz);
                
                let maxHzIndex = notesFrequency.frequency.findIndex(function(elem, index){
                    return elem > fMax;
                });

                let newNotes = notesFrequency.note.slice(0,maxHzIndex);
                // calculate postion values using yScaleHz
                let newPos = notesFrequency.frequency.slice(0,maxHzIndex).map(function(d){ return yScaleHz(d); });

                yScaleNote
                .domain(newNotes)
                .range(newPos);

                d3.select(".axisRight").transition().call(axisNote);

                d3Data.forEach(function(d,i){
                    d.y = yScaleHz(d.f);
                });

                d3.selectAll(".dot").data(d3Data, function(d){ return d.key; })
                .transition()
                .attr("cy", function(d){ return d.y; });
            }

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
                displayData(analyseFile, '150,150,255');
                displayData(analyseMic, '150,255,150');
            }

            function displayData(analyser, color) {
                updateData(analyser);
                updateDots(color);
            }

            function updateDots(color) {
                let selections = svg.selectAll(".dot")
                .data(d3Data, function(d){ return d.key; });

                // update existing
                selections.attr("cx", function(d){ return d.x; });        
                
                // adding new
                selections.enter().append("circle")                             
                .attr("class", "dot")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d) { return 'rgb(' + color + ')'; });

                // remove
                selections.exit().remove();
            }

            function updateText() {
                selections = svg.selectAll(".txt")
                .data(d3Data, function(d){ return d.key; });

                selections
                .attr("x", function(d){ return d.x; });        // update existing

                selections
                .enter().append("text")
                .attr("class", "txt")
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; })
                .attr("dy",radius/2)
                .attr("font-size","10pt")
                .attr("text-anchor","middle")
                .attr("stroke","#FF0000")
                .attr("stroke-width","0.1px")
                .text("c");

                selections
                .exit().remove();
            }

            function updateData(analyser) {
                // get the fft data from the analyser
                let data = new Float32Array(fftBinCount);
                analyser.getFloatFrequencyData(data);

                let ltuv = getLowerThreshold(data).ltuv;

                // modify x coordinate of existing data points to scroll
                d3Data = d3Data.map(function(d){
                    d.x = d.x - 1;
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

                    if (data[i] > analyser.minDecibels && data[i] >= ltuv) {
                        let newKey;
                        if (d3Data.length === 0) newKey = 0;
                        else newKey = d3Data[d3Data.length-1].key + 1;
                        d3Data.push({
                                x: width-margin.right-margin.left-1,
                                y: yScaleHz(getFrequency(i)),
                                key: newKey,
                                signal: data[i],
                                f: getFrequency(i)
                        });
                    }
                }
            }
        }
    }
});
