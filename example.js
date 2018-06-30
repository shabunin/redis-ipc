const IPC = require('./index');

let myIPC = IPC();

myIPC.on('connect', _ => {
  console.log('connect event');
  myIPC
    .subscribe('0x00/playback/state')
    .on('subscribe', _ => {
      myIPC.publish('0x00/playback/state', 'Hello, friend');
    })
    .on('message', message => {
      console.log(`got message: ${message}`);
      myIPC.unsubscribe('0x00/playback/state');

      myIPC
        .subscribe('hello')
        .on('subscribe', _ => {
          myIPC.publish('hello', 'friend');
        })
        .on('message', message => {
          console.log(`another message: ${message}`);
        });
    });
});

myIPC.on('error', err => {
  console.log(`err ${err}`);
});
