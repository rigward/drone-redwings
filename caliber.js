var Drone = require('ar-drone'),
client = Drone.createClient();
console.log('started');
client.createRepl();
client.disableEmergency();
client.ftrim();
