// pull in desired CSS/SASS files
require( './styles/main.scss' );
var $ = jQuery = require( '../../node_modules/jquery/dist/jquery.js' );           // <--- remove if Bootstrap's JS not needed
require( '../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js' );   // <--- remove if Bootstrap's JS not needed

// inject bundled Elm app into div#main
var Elm = require( '../elm/Program' );
var elm = Elm.Main.embed( document.getElementById( 'main' ) );


var audioContext = new AudioContext();

var useCompass = false;

elm.ports.setListenerOrientationCmd.subscribe(
  function(orientation3D) {
    // console.log('orientation3D', orientation3D);
    var noseVector = orientation3D[0];
    var topOfHeadVector = orientation3D[1];

    // console.log('noseVector', noseVector);
    // console.log('topOfHeadVector', topOfHeadVector);

    audioContext.listener.setOrientation(
      noseVector.x,
      noseVector.y,
      noseVector.z,
      topOfHeadVector.x,
      topOfHeadVector.y,
      topOfHeadVector.z
    );
  }
);

elm.ports.setMuteStateCmd.subscribe(
  function(muted) {
    console.log('muted', muted);
    if (muted) {
      muteNode.gain.value = 0.0;
    } else {
      muteNode.gain.value = 1.0;
    }
  }
);

elm.ports.setCompassStateCmd.subscribe(
  function(localUseCompass) {
    console.log('change compass state');
    useCompass = localUseCompass;
  }
);

elm.ports.setPanningModelCmd.subscribe(
  function(panningModel) {
    panner.panningModel = panningModel;
  }
);

elm.ports.setDistanceCmd.subscribe(
  function(distance) {
    // panner.setPosition(0, 0, distance);
  }
);



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
panner.setPosition(0, 0, 5); // 5 metres in front of the listener
// panner.setPosition(5, 0, 5);


var angleDegrees = 90;

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

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

muteNode = audioContext.createGain();
muteNode.gain.value = 1.0;

// whiteNoise.connect(audioContext.destination);
panner.connect(muteNode)
muteNode.connect(audioContext.destination);

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', function(event) {
    var alpha = event.alpha;  //compass angle in degrees
    //var beta = event.beta;
    //var gamma = event.gamma;
    // Do something
    angleRadians = degreesToRadians(alpha);

    var z = Math.sin(angleRadians);
    var x = Math.cos(angleRadians);
    if (useCompass) {
      panner.setPosition(x, 0, z);
    }
  }, false);
} else {
  console.log('DeviceOrientationEvent not supported');
}
