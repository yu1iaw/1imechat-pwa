import Aos from "aos";
import 'aos/dist/aos.css';
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import platform from "platform";
import { db } from "./firebase";


Aos.init({
    duration: 1000,
    offset: 100
});

const sendStoredMessages = async () => {
    if (!localStorage.getItem("username")) return;

    const messagesSnapshot = await getDocs(collection(db, localStorage.getItem("username")));
    const messages = JSON.parse(localStorage.getItem('messages'));
    messagesSnapshot.forEach(async d => {
        if (messages.some(item => item.content === d.data().content &&
            item.author === d.data().author &&
            item.date === d.data().date)) {
            await deleteDoc(doc(db, localStorage.getItem("username"), d.id));
        } else {
            sendMessage(d.data());
        }
    })
}

sendStoredMessages();

const mobileDevice = platform.os.family === "Android" || platform.os.family === "iOS" || platform.os.family === "Windows Phone";
const messagesTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login', LOGOUT: 'logout' };
const audio = new Audio('happy-pop.mp3');
let username = '';
let clientIp;
let messages = localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')) : []; // { author, date, content, type }
let isAdmin = false;

fetch('https://www.yu1iadev.website/myip')
    .then(res => res.json())
    .then(data => {
        clientIp = data.ip;
        isAdmin = data.ip?.slice(0, 11) === import.meta.env.VITE_ADMIN_PUBLIC_IP.slice(0, 11);
    })
    .catch(e => console.log(e))

// Chat Stuff
const headerInfo = document.querySelector("header .info");
const chatContainer = document.querySelector('#chat');
const messagesList = document.querySelector('#messagesList');
const messageForm = document.querySelector('#messageForm');
const messagesInput = document.querySelector('#messageInput');
const sendBtn = document.querySelector('#sendBtn');
// Login Stuff
const loginContainer = document.querySelector('#login');
const usernameInput = document.querySelector('#usernameInput');
const loginBtn = document.querySelector('#loginBtn');


var socket = io(/*import.meta.env.VITE_SOCKETIO_SERVER,*/'https://www.yu1iadev.website', {
    reconnectionDelay: 1000,
    reconnectionDelayMax: 3000
});

socket.on("connect", () => {
    if (socket.recovered && username && !mobileDevice) {
        sendMessage({
            author: username,
            date: new Date(),
            type: messagesTypes.LOGIN,
            id: socket.id
        });
    }
})


socket.on('message', (message) => {
    headerInfo.children[0].textContent = `In the room: ${message.infoTotal}`;

    if (message.type !== messagesTypes.LOGIN && message.type !== messagesTypes.LOGOUT) {
        if (message.author === username || message.author === localStorage.getItem("username")) {
            message.type = messagesTypes.RIGHT;
        } else {
            message.type = messagesTypes.LEFT;
            audio.play();
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('LIME CHAT', {
                        body: `${message.author} sent a message...`,
                        icon: 'icons/icons8-chat-32.png',
                        // tag: "trigger notification"
                    })
                }
            })
        }
    } else {
        if (message.author !== username) {
            getNotification(message);
        }
    }
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    displayMessages();

    chatContainer.scrollTop = chatContainer.scrollHeight;
})

const createMessageHTML = (message) => {
    if (message.type === messagesTypes.LOGIN) {
        return `
            <p class="secondary-text text-center mb-2">${message.author} has joined the chat...</p>
        `;
    }

    if (message.type === messagesTypes.LOGOUT) {
        return `
            <p class="secondary-text text-center mb-2">${message.author} has left the chat...</p>
        `;
    }

    return `
        <div class="message ${message.type === messagesTypes.LEFT ? 'message-left' : 'message-right'}">
            <div class="message-details flex">
                <p class="message-author">
                    ${message.type === messagesTypes.RIGHT ? '<span>you</span>' : message.author}
                </p>
                <p class="message-date">${message.date}</p>
            </div>
            <p class="message-content">${message.content}</p>
        </div>
    `
}

const displayMessages = () => {
    const messagesHTML = messages
        .map(message => createMessageHTML(message))
        .join('');

    messagesList.innerHTML = messagesHTML;
}

displayMessages();


loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!usernameInput.value) return;

    username = usernameInput.value;
    localStorage.setItem("username", username);

    const message = {
        author: username,
        date: new Date(),
        type: messagesTypes.LOGIN,
        id: socket.id
    };
    
    if (mobileDevice && window.matchMedia('(display-mode: minimal-ui)').matches) {
        const lastSocketId = localStorage.getItem('lastSocketId');
        if (lastSocketId) {
            message.pwaNewSession = true;
            message.socketIdToRemove = lastSocketId;
        }
        localStorage.setItem('lastSocketId', socket.id);
    }

    sendMessage(message);

    loginContainer.classList.add('hidden');
    messageForm.classList.remove('hidden');
    chatContainer.classList.remove('hidden');
    headerInfo.classList.remove('invisible');
})

sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!messagesInput.value) return;

    const date = new Date();
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const dateString = `${day}/${month}/${year}`;

    const message = {
        author: username || localStorage.getItem("username"),
        date: dateString,
        content: messagesInput.value
    };

    if (!navigator.onLine) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="message message-right opacity">
                <div class="message-details flex">
                    <p class="message-author"><span>you (offline)</span></p>
                    <p class="message-date">${message.date}</p>
                </div>
                <p class="message-content">${message.content}</p>
            </div>
        `;
        messagesList.append(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        await addDoc(collection(db, message.author), {
            ...message
        });
    }

    sendMessage(message);
    messagesInput.value = '';
   
    if (clientIp && !isAdmin) {
        const emailForm = {
            name: message.author,
            email: "email",
            message: message.content
        };
        emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_TOKEN, import.meta.env.VITE_EMAILJS_TEMPLATE_TOKEN, emailForm, { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY })
            .catch(e => console.log(e))
    }
})


const sendMessage = (message) => {
    socket.emit('message', message);
}


const resetStorage = () => {
    if (!messages.length) return;

    const date = messages[0].date;

    if (new Date() - new Date(date.split('/').reverse().join('-')) >= 259200000) {
        localStorage.removeItem("messages");
        messages = [];
    }
}

resetStorage()


const getNotification = (message) => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('LIME CHAT', {
                body: `${message.author} has ${message.type === messagesTypes.LOGIN ? 'joined' : 'left'} the chat...`,
                icon: 'icons/icons8-chat-32.png',
                // tag: "action"
            })
        }
    })
}

let timeoutId;

document.addEventListener("visibilitychange", () => {
    if (!window.matchMedia('(display-mode: minimal-ui)').matches && document.visibilityState === "hidden" && username) {
        timeoutId = setTimeout(() => {
            location.reload();
        }, 180000)
    } else {
        if (timeoutId) clearTimeout(timeoutId)
    }
})
