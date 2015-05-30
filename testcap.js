var VerticalSpeed = '4.0',
    Commands = ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
        'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
        'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
        'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight'],
    Drone = require('ar-drone'),
    EndKey;
client = Drone.createClient();
console.log('started');
client.createRepl();
//client.disableEmergency();
client.config('control:control_vz_max', '2000', function(){console.log('here');});
client.config('control:altitude_max', '3000', function(){console.log('here');});
client.takeoff();

setTimeout(Loop, 2000);

function Loop(){
    console.log('Loop started');
    EndKey = setInterval(ApplyCommand, 3000);
}
function ApplyCommand(){
    console.log('Sent command');
    if (Commands.length){
        var current = Commands.pop();
            client.animate('doublePhiThetaMixed', 2000);
    }
    else{
        if(EndKey){
            client.stop();
            clearInterval(EndKey);
        }
    }
}
client.after(6000, function(){this.land();});




function GenerateBehaviour()
{
    for (var i = 0; i< 5; i++) {
        Commands.add({x: i})
    }
}