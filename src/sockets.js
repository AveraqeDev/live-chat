/* eslint-disable no-console */
const SocketIO = require('socket.io');

module.exports = (server) => {
  const io = SocketIO(server);
  const clients = {};
  const messages = [];

  let hasUpdate = false;
  io.on('connection', (socket) => {
    clients[socket.id] = { connected: true, name: `Guest#${Math.floor(Math.random() * 999999)}`, notifications: [] };
    console.log('Client connected...');
    console.log('Total Connected Clients:', Object.keys(clients).length);
    messages.push({ sender: '', text: `${clients[socket.id].name} has joined the chat room.`, type: 'is-success' });
    hasUpdate = true;

    socket.on('message', ({ message }) => {
      const client = clients[socket.id];
      if (message.startsWith('/name ')) {
        const newName = message.substring(6);
        const oldName = client.name;

        const exists = Object.values(clients).find((c) => c.name === newName) !== undefined;

        if (exists) {
          const notification = { message: `Somebody in the chat room already has the name '${newName}'. Please choose another name.`, type: 'is-danger' };
          client.notifications.push(notification);
          socket.emit('notification', notification);
        } else {
          client.name = newName;

          const notification = { message: `Successfully updated your name to '${newName}'`, type: 'is-success' };
          client.notifications.push(notification);
          socket.emit('notification', notification);

          messages.forEach((msg, index) => {
            if (msg.sender === oldName) {
              messages[index].sender = newName;
            }
            if (msg.text.includes(oldName)) {
              console.log(messages[index].text);
              messages[index].text = messages[index].text.replace(oldName, newName);
              console.log(messages[index].text);
            }
          });
          io.emit('messages', messages);
        }
      } else if (message.toLowerCase() === '/notifications') {
        client.notifications.forEach((notification) => socket.emit('notification', notification));
      } else {
        const sender = clients[socket.id].name;
        messages.push({ sender, text: message, type: 'is-info' });
        hasUpdate = true;
      }
    });

    socket.on('disconnect', () => {
      const client = clients[socket.id];
      messages.push({ sender: '', text: `${client.name} has left the chat room.`, type: 'is-danger' });
      hasUpdate = true;
      delete clients[socket.id];

      console.log('Client disconnected...');
      console.log('Total Connected Clients:', Object.keys(clients).length);
    });
  });

  setInterval(() => {
    if (hasUpdate) {
      io.emit('messages', messages);
      hasUpdate = false;
    }
  }, 300);
};
