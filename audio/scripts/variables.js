define(function(){
    return {
        init: function(audioContext) {
            return {
                audioVariables: {
                    sampleRate: audioContext.sampleRate,
                    fMin: 0,
                    fMax: 1200, //sampleRate / 4;
                    fftBinCount: Math.pow(2,13), // must be a power of 2
                    get bufferSize() { return this.fftBinCount * 2; },
                    get fBin() { return this.sampleRate / this.fftBinCount; },
                    get numberOfRelevantBins() { return Math.ceil(this.fMax / this.fBin); }
                },

                displayProperties: {
                    marginLeft: 50,
                    marginRight: 80,
                    marginTop: 10,
                    marginBottom: 10,
                    height: window.innerHeight-150,
                    width: window.innerWidth,
                    get drawHeight() { return this.height - this.marginTop - this.marginBottom; },
                    get drawWidth() { return this.width - this.marginLeft - this.marginRight; }
                }
            }
        }
    }
})