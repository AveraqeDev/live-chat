const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messagesContainer = document.getElementById('messages');
const socket = io();

bulmaToast.setDefaults({
  duration: 5000,
});

function scrollToBottom() {
  document.getElementById('last-message').scrollIntoView({ behavior: 'smooth' });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  socket.emit('message', { message: input.value });
  input.value = '';
});

function updateMessages(messages) {
  const messageElements = messages.map((message) => `<article class="chat-message message ${message.type}"><div class="message-header"><p>${message.sender}</p></div><div class="message-body">${message.text}</div></article>`);
  messagesContainer.innerHTML = `${messageElements.join('')}<div id="last-message" />`;
  scrollToBottom();
}

function handleNotification({ message, type }) {
  bulmaToast.toast({ message, type });
}

socket.on('messages', updateMessages);

socket.on('notification', handleNotification);
