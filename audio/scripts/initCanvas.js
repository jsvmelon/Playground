define(function(){
    return {
        init: function(ctx,margin,fMax,width,height) {
            console.log("initCanvas.init");
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.lineWidth = 1;
            ctx.moveTo(margin.left,margin.top); 
            ctx.lineTo(margin.left,height-margin.bottom);        // y-axis line
            ctx.lineTo(width-margin.right,height-margin.bottom); // x-axis line

            let tickDistance = 20;
            let drawHeight = height - margin.bottom - margin.top;
            ctx.font = "10px Arial";
            for (var y = tickDistance; y <= drawHeight; y += tickDistance) {
                ctx.moveTo(margin.left,height - y - margin.bottom);
                ctx.lineTo(margin.left-5,height - y - margin.bottom);
                let prop = y / drawHeight;
                ctx.fillText(Math.round(prop * (fMax)) + " Hz",0,height - y - margin.bottom + 2);
            }
            ctx.stroke();
        }
    }
});