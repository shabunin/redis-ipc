============
redis-ipc
============

Simple package to publish/subscribe to IPC channels.

Main purpose of this module is to create separate publish/subscribe redis client instances in one object.

With redis client you would work with subscribe/publish in the next way:

.. code-block:: javascript

    var redis = require("redis");
    var sub = redis.createClient(), pub = redis.createClient();
    var msg_count = 0;

    sub.on("subscribe", function (channel, count) {
        pub.publish("a nice channel", "I am sending a message.");
        pub.publish("a nice channel", "I am sending a second message.");
        pub.publish("a nice channel", "I am sending my last message.");
    });

    sub.on("message", function (channel, message) {
        console.log("sub channel " + channel + ": " + message);
        msg_count += 1;
        if (msg_count === 3) {
            sub.unsubscribe();
            sub.quit();
            pub.quit();
        }
    });

    sub.subscribe("a nice channel");

So, we combine this two redis client instances in one object and expose functions to publish, subscribe and return EventEmitter for incoming messages:

.. code-block:: javascript

    const IPC = require('redis-ipc');

    let myIPC = IPC({
      debug: false
    });

    myIPC.on('connect', _ => {
      console.log('connect event');
      myIPC
        .subscribe('0x00/playback/state')
        .on('subscribe', _ => {
          myIPC
            .publish('0x00/playback/state', "Hello, friend");
        })
        .on('message', message => {
          console.log(`got message: ${message}`);
          myIPC
            .unsubscribe('0x00/playback/state');

          myIPC
            .subscribe('hello')
            .on('subscribe', _ => {
              myIPC
                .publish('hello', 'meow');
            })
            .on('message', message => {
              console.log(`another message: ${message}`);
            })
        });
    });


    myIPC.on('error', err => {
      console.log(`err ${err}`)
    });