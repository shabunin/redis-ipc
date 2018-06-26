const IPC = require('./index');

let myIPC = IPC({
  debug: true
});

myIPC.on('connect', _ => {
  console.log('connect event');
  myIPC
    .subscribe('0x00/playback/state')
    .on('message', message => {
      console.log(`got message: ${message}`);
    });
  myIPC
    .publish('0x00/playback/state', "Hello, friend");
});


myIPC.on('error', err => {
  console.log(`err ${err}`)
});