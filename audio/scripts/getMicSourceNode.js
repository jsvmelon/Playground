define(function() {
    return {
        create: function(audioContext,targetNode,connectFile,draw) {
            let constraints = {
                audio: true,
                video: false
            };

            navigator.mediaDevices.getUserMedia(constraints).
            then(function(mediaStream) {
                // here I can use the stream 
                console.log("entering promise")

                // this is a source node for the mic
                var sourceNodeMic = audioContext.createMediaStreamSource(mediaStream);
                sourceNodeMic.connect(targetNode);
                targetNode.connect(audioContext.destination);
                connectFile();
                draw();
            })
            .catch(function(err) {
                console.log(err)
            });

        }
    }
})