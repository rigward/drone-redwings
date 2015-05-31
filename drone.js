var Commands = [],
    Drone = require('ar-drone'),
    EndKey;
    client = Drone.createClient();
console.log('started');
client.createRepl();
client.disableEmergency();
client.ftrim();
//client.config('control:control_vz_max', '2000', function(){console.log('here');});
client.config('control:altitude_max', '1700', function(){console.log('here');});


setTimeout(Loop, 3000);

function Loop(){
    console.log('Loop started');
    EndKey = setInterval(ApplyCommand, 200);
}
function ApplyCommand(){
    console.log('Sent command');
    if (Commands.length){
        var current = Commands.pop();

    }
    else{
        if(EndKey){
            client.stop();
            clearInterval(EndKey);
        }
    }
}
client.after(20000, function(){this.land();});  //Stops drone after 20 seconds

function MakeStep(data){
    if (data.z){
        client.up(1);
    }
    else{
        client.down(1);
    }
}

function GenerateBehaviour()
{
    for (var i = 0; i< 5; i++) {
        Commands.add({z: i})
    }
}