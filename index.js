const EE = require('events');
const redis = require('redis');

const _IPC = (params) => {
  let self = new EE();
  // debugging
  self._debug = false;
  if (Object.prototype.hasOwnProperty.call(params, 'debug')) {
    self._debug = params.debug;
  }
  self.debug = (...args) => {
    if (self._debug) {
      console.log(`[IPC]: ${args}`);
    }
  };

  // redis client pub/sub
  self.path = '/var/run/redis/redis.sock';
  if (Object.prototype.hasOwnProperty.call(params, 'path')) {
    self.path = params.path;
  }
  self._client = {};
  self._client.connectPublisher = _ => {
    return new Promise((resolve, reject) => {
      self._client.pub = redis.createClient(self.path);
      self._client.pub.on('connect', _ => {
        self.debug(`Redis client.pub connected`);
        resolve()
      });
      self._client.pub.on('error', (err) => {
        self.debug(`Redis client.pub error ${err}`);
        reject(err);
      });
    });
  };
  self._client.connectSubscriber = _ => {
    return new Promise((resolve, reject) => {
      self._client.sub = redis.createClient(self.path);
      self._client.sub.on('connect', _ => {
        self.debug(`Redis client.sub connected`);
        resolve()
      });
      self._client.sub.on('error', (err) => {
        self.debug(`Redis client.sub error ${err}`);
        reject(err);
      });
    });
  };

  // now connect both
  self._client.connectPublisher()
    .then(_ => {
      return self._client.connectSubscriber()
    })
    .then(_ => {
      self.debug(`Redis client.pub/sub connected`);
      self.emit('connect');
    })
    .catch(err => {
      self.debug(`Redis client.pub/sub error ${err}`)
    });

  // public funcs
  self.subscribe = (channel) => {
    let _ee = new EE();
    self._client.sub.on('subscribe', (_channel, _count) => {
      if (_channel === channel) {
        self.debug(`Redis client.sub subscribed to "${_channel}", ${_count}`);
        _ee.emit('subscribe');
      }
    });
    self._client.sub.on('message', (_channel, _message) => {
      if (_channel === channel) {
        self.debug(`Redis client.sub got message: "${_message}" from channel "${_channel}"`);
        _ee.emit('message', _message);
      }
    });
    self._client.sub.subscribe(channel);
    return _ee;
  };

  self.unsubscribe = (channel) => {
    self._client.sub.unsubscribe(channel);
  };

  self.publish = (channel, message) => {
    self._client.pub.publish(channel, message);
  };
  return self;
};

module.exports = _IPC;