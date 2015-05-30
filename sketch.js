/**
 * Toggle play mode between 'restart' and 'sustain'.
 * Sustain is the default playmode for SoundFiles
 * Music from Damscray, "Dancing Tiger", Creative Commons BY-NC-SA
 */

var playMode = 'sustain';
var sample1;

function preload(){
    sample1 = loadSound('1.mp3');
}
function setup() {
  createCanvas(1000,1000);
  sample1 = loadSound('1.mp3');
  sample1.play();
  fft = new p5.FFT();
}

function draw() {
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
