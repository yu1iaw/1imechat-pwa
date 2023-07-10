import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, setDoc, deleteDoc, getDocs, enableNetwork, doc, onSnapshot, query, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js');
}

const firebaseConfig = {
  apiKey: "AIzaSyDkaVyzXvH7dYAsigIp80udMg8iuY9-370",
  authDomain: "ninja--pwa.firebaseapp.com",
  projectId: "ninja--pwa",
  storageBucket: "ninja--pwa.appspot.com",
  messagingSenderId: "481871428710",
  appId: "1:481871428710:web:88461683279f3725e101a7",
  measurementId: "G-5J9E7QV72D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db)
    .then(() => {

    })
    .catch(err => {
       console.log(err);
    })


if (localStorage.getItem("username")) {
    const q = query(collection(db, localStorage.getItem("username")));
    onSnapshot(q, (snapshot) => {  
        snapshot.docChanges().forEach(async change => {
            // if (change.type === 'added' && change.doc.metadata.hasPendingWrites) {
            //     sendMessage(change.doc.data());
            // } else if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) {
            //     for (let i = 0; i < snapshot.size; i++) {
            //         await deleteDoc(doc(db, localStorage.getItem("username"), i.toString()));
            //     }
            // }

            if (change.type === 'added') {
                const messages = JSON.parse(localStorage.getItem('messages'));
                const existingMessages = messages.filter(item => item.content === change.doc.data().content && item.author === change.doc.data().author && item.date === change.doc.data().date);
                if (existingMessages.length) {
                    for (let i = 0; i < snapshot.size; i++) {
                        await deleteDoc(doc(db, localStorage.getItem("username"), i.toString()));
                    }
                } else {
                    sendMessage(change.doc.data());
                }
            }
        })
    });
}

AOS.init({
    duration: 1000,
    offset: 100
});

const messagesTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login', LOGOUT: 'logout' };
const firestoreMessages = [];

// Chat Stuff
const chatContainer = document.querySelector('#chat');
const messagesList = document.querySelector('#messagesList');
const messageForm = document.querySelector('#messageForm');
const messagesInput = document.querySelector('#messageInput');
const sendBtn = document.querySelector('#sendBtn');
// Login Stuff
let username = '';
const loginContainer = document.querySelector('#login');
const usernameInput = document.querySelector('#usernameInput');
const loginBtn = document.querySelector('#loginBtn');

const audio = new Audio('little-boy-saying-hiya.wav');
let messages = localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')) : []; // { author, date, content, type }
var socket = io({
    query: {
      login: username
    }
});

socket.io.on("reconnect_attempt", () => {
    socket.io.opts.query.login = username;
});


socket.on('message', (message) => {
    // console.log(message);
    if (message.type !== messagesTypes.LOGIN && message.type !== messagesTypes.LOGOUT) {
        if (message.author === username || message.author === localStorage.getItem("username")) {
            message.type = messagesTypes.RIGHT;
        } else {
            message.type = messagesTypes.LEFT;
            let promise = audio.play();
            if (promise !== undefined) {
                promise.then(_ => promise)
                .catch(_ => {
                    new Notification('KNEE-JERK CHAT', {
                        body: `${message.author} sent a message...`,
                        icon: 'icons/icons8-chat-32.png',
                        tag: "trigger notification"
                    })
                });
            }
        }
    } else {
        if (message.author !== username ) {
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
                <p class="message-author">${message.type === messagesTypes.RIGHT ? '' : message.author}</p>
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

    sendMessage({
        author: username,
        date: new Date(),
        type: messagesTypes.LOGIN,
        // app: window.matchMedia('(display-mode: minimal-ui)').matches,
        id: socket.id
    });

    loginContainer.classList.add('hidden');
    messageForm.classList.remove('hidden');
    chatContainer.classList.remove('hidden');

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

    if (navigator.onLine) {
        sendMessage(message);
    } else {
        firestoreMessages.push(message);
        firestoreMessages.forEach(async (message, i) => {
            await setDoc(doc(db, message.author, i.toString()), {...message});
        })
        messages.push(message);
        displayMessages();
       
    }

    messagesInput.value = '';
})

const sendMessage = (message) => {
    socket.emit('message', message);
}


const resetStorage = () => {
    if (!messages.length) return;

    const date = messages[0].date;
 
    if (new Date() - new Date(date) >= 432000000) {
        localStorage.removeItem("messages");
        messages = [];
    }
}

resetStorage()


const getNotification = (message) => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('KNEE-JERK CHAT', {
                body: `${message.author} has ${message.type === messagesTypes.LOGIN ? 'joined' : 'left'} the chat...`,
                icon: 'icons/icons8-chat-32.png'
            })
        }
    })
}

let timeoutId;

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && username) {
        timeoutId = setTimeout(() => {
            location.reload();
        }, 180000)
    } else {
        if (timeoutId) clearTimeout(timeoutId)
    }
})
