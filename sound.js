var viz;
var song;
window.onload=function(){
    viz = false;
    var button = document.getElementById('playButton');
    //button.onclick = mousePressed();
};

function preload(){
    song = loadSound('1.mp3');
}
function setup() {
    /*amplitude = new p5.Amplitude();
    var best = song.getPeaks(100);
    createCanvas(720, 200);
    background(255,0,0);*/
    createCanvas(1000,1000);
    song.play();
    fft = new p5.FFT();
}

function mousePressed() {
    viz = !viz;
    if ( song.isPlaying() ) { // .isPlaying() returns a boolean
        song.stop();
        background(255,0,0);
    } else {
        song.play();
        background(0,255,0);
    }
}
/*function draw() {
    background(0);
    fill(255);
    var level = amplitude.getLevel();
    console.log(level);
    var size = map(level, 0, 1, 0, 200);
    ellipse(width/2, height/2, size, size);
}*/

function draw(){
    background(0);

    var spectrum = fft.analyze();
    noStroke();
    fill(0,255,0); // spectrum is green
    for (var i = 0; i< spectrum.length; i++){
        var x = map(i, 0, spectrum.length, 0, width);
        var h = -height + map(spectrum[i], 0, 255, height, 0);
        rect(x, height, width / spectrum.length, h )
    }

    var waveform = fft.waveform();
    noFill();
    beginShape();
    stroke(255,0,0); // waveform is red
    strokeWeight(1);
    for (var i = 0; i< waveform.length; i++){
        var x = map(i, 0, waveform.length, 0, width);
        var y = map( waveform[i], 0, 255, 0, height);
        vertex(x,y);
    }
    endShape();
    }

while(true) {
    draw();
}
