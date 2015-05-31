/**
 * Display the average amount of energy (amplitude) across a range
 * of frequencies using the p5.FFT class and its methods analyze()
 * and getEnergy().
 *
 * This example divides the frequency spectrum into eight bands.

 */
var FREQUENCY = 3;
var soundFile;
var fft;
var socket;
var description = 'loading';
var p;

function preload() {
    //soundFormats('mp3', 'ogg');
    soundFile = loadSound('files/222.mp3');
}

function setup() {
    createCanvas(1024, 400);
    fill(255, 40, 255);
    noStroke();
    textAlign(CENTER);
    fft = new p5.FFT();
    p = createP(description);
    var p2 = createP('Description: Using getEnergy(low, high) to measure amplitude within a range of frequencies.');
    socket = io.connect('http://localhost');
}

function draw() {
    if (!soundFile.isPlaying()) {
        return;
    }
    background(30, 20, 30);
    updateDescription();
    fft.analyze(); // analyze before calling fft.getEnergy()

    // Generate 8 bars to represent 8 different frequency ranges
    for (var i = 0; i < FREQUENCY; i++) {
        if (!soundFile.isPlaying()) {
            return;
        }
        noStroke();
        fill((i * 30) % 100 + 50, 195, (i * 25 + 50) % 255)

        // Each bar has a unique frequency range
        var centerFreq = (pow(2, i) * 125) / 2;
        var loFreq = (pow(2, i - 1) * 125) / 2 + centerFreq / 4;
        var hiFreq = (centerFreq + centerFreq / 2);

        // get the average value in a frequency range
        var freqValue = fft.getEnergy(loFreq, hiFreq - 1);

        // Rectangle height represents the average value of this frequency range
        var h = -height + map(freqValue, 0, 255, height, 0);

        //console.log(h + height, h + height > height / 2);

        socket.emit('mouse', {
            t: i,
            //f: freqValue,
            f: h + height
            //c: centerFreq,
            //l: loFreq,
            //h: hiFreq
            //g: h + height > height / 2
        });
        rect((i + 1) * width / FREQUENCY - width / FREQUENCY, height, width / FREQUENCY, h);
        stroke(255);
        text(loFreq.toFixed(0) + ' Hz - ' + hiFreq.toFixed(0) + ' Hz', (i + 1) * width / FREQUENCY - width / FREQUENCY / 2, 30);
    }
}


var getMax = function (elmt) {
    var m = 0;
    for (var i = 0; i < elmt.length; i++) {
        m = Math.max(parseInt(elmt[i], 10), m); //don't forget to add the base
    }
    return m;
};
function draw2() {
    if (!soundFile.isPlaying()) {
        return;
    }
    background(30, 20, 30);
    updateDescription();
    var waveform = fft.waveform(),
        energy = getMax(waveform),
        i = 0;
    console.log(energy);
    // Generate 8 bars to represent 8 different frequency ranges
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
    // Each bar has a unique frequency range


    // Rectangle height represents the average value of this frequency range
    var h = -height + map(energy, 0, 255, height, 0);

    //console.log(h + height, h + height > height / 2);

    socket.emit('mouse', {
        t: i,
        //f: freqValue,
        f: h + height
        //c: centerFreq,
        //l: loFreq,
        //h: hiFreq
        //g: h + height > height / 2
    });
}

function keyPressed(e) {
    if (e.keyCode == 32) {
        if (soundFile.isPlaying()) {
            soundFile.pause();
            socket.emit('voice', 'stop');
        } else {
            socket.emit('voice', 'dance');
            soundFile.play();
        }
    }
}

// Change description text if the song is loading, playing or paused
function updateDescription() {
    if (soundFile.isPaused()) {
        description = 'Paused...';
        p.html(description);
    }
    else if (soundFile.isPlaying()) {
        description = 'Playing!';
        p.html(description);
    }
    else {
        for (var i = 0; i < frameCount % 3; i++) {

            // add periods to loading to create a fun loading bar effect
            if (frameCount % 4 == 0) {
                description += '.';
            }
            if (frameCount % 25 == 0) {
                description = 'loading';

            }
        }
        p.html(description);
    }
}

function DroneLand() {
    socket.emit('voice', 'land');
}

function StartPerfomance() {
    if(!soundFile.isPlaying()){
    socket.emit('voice', 'perfom');
    setTimeout(function(){
        soundFile.loop();}, 2000);
    }
}
function StopPerfomance(){
    socket.emit('voice', 'land');
    soundFile.stop();
}
