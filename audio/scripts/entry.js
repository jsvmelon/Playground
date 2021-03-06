define(["play","d3","d3fc"], function(play,d3,fc) {
    // testD3fc();

    var fileElement = document.getElementById('file');
    fileElement.addEventListener('change', triggerPlay);

    var audiosrc = document.getElementById('src');
    audiosrc.src = '';

    function triggerPlay() {
        //var canvas = document.getElementById("canvas");
        var files = fileElement.files;

        if (files.length > 0) { // we are only interested in the first file - no multiselect here            
            audiosrc.src = files[0].name;
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            play.playFile(audioContext);
        }
    }
});