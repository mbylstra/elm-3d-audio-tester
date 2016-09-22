var audioContext = new AudioContext();

audioContext.listener.setOrientation(0, 0, -1, 0, 1, 0);
// audioContext.listener.setOrientation(1, 0, -1, 0, 1, 0);



var bufferSize = 2 * audioContext.sampleRate;
var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
var output = noiseBuffer.getChannelData(0);

for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
}

function createWhiteNoiseNode() {
  var whiteNoise = audioContext.createScriptProcessor(1024, 1, 2);
  whiteNoise.onaudioprocess = function(e) {
    var L = e.outputBuffer.getChannelData(0);
    var R = e.outputBuffer.getChannelData(1);
    for (var i = 0; i < L.length; i++) {
      L[i] = ((Math.random() * 2) - 1);
      R[i] = L[i];
    }
  }
  return whiteNoise;
}


var panner = audioContext.createPanner();
panner.panningModel = "HRTF";
// panner.panningModel = "equalpower";
// panner.setPosition(0, 0, 0);
// panner.setPosition(5, 0, 5);


var angleDegrees = 90;
var dispay = document.getElementById('display');
setInterval(function() {
  angleDegrees = (angleDegrees + 5) % 360;
  angleRadians = degreesToRadians(angleDegrees);

  // var distance = 0.05;
  var distance = 10;
  var z = Math.sin(angleRadians) * distance;
  var x = Math.cos(angleRadians) * distance;
  panner.setPosition(x, 0, z);

  display.innerText = angleDegrees;
  // console.log(angle);
}, 100);

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}


// function fmod = function(a, b) {
//   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
// };




function createOscillatorNode(frequency, type) {
  var oscillator = audioContext.createOscillator();
  oscillator.type = type;
  // oscillator.type = 'sin';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.start();
  return oscillator;
}



var whiteNoise = createWhiteNoiseNode();
var note1 = createOscillatorNode(80, 'sawtooth');
var note2 = createOscillatorNode(120, 'sawtooth');
// var note3 = createOscillatorNode(240, 'triangle');
var note3 = createOscillatorNode(240, 'sawtooth');
// var note3 = createOscillatorNode(635, 'square');


whiteNoise.connect(panner);
note1.connect(panner);
note2.connect(panner);
note3.connect(panner);

// whiteNoise.connect(audioContext.destination);
panner.connect(audioContext.destination);
