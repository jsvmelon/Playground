define(function(){
    return {
        create: function(audioContext,hertz) {
            if (hertz === undefined) hertz = 10000;
            let oscilSource = audioContext.createOscillator();
            oscilSource.type = "sine";
            oscilSource.frequency.setValueAtTime(hertz, audioContext.currentTime); // value in hertz
            return oscilSource;
        }
    }
});