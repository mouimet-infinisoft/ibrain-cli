// Speech Recognition
const speechRecognition = new webkitSpeechRecognition();
speechRecognition.lang = 'en-US';
speechRecognition.continuous = true;

// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const sendBtn = document.getElementById('send-btn');
const shutUpBtn = document.getElementById('shutup-btn');
const chatLog = document.getElementById('chat-log');

// Add onclick event to shutup button to stop text to speech
shutUpBtn.addEventListener('click', e => {
    e.preventDefault(); // Prevent default behavior
    speechSynthesis.cancel(); // Stop text to speech
});
// Text-to-Speech
const speechSynthesis = window.speechSynthesis;
let voices = []; // Initialize voices array
let voice; // Initialize voice variable

// Load voices and set the default voice
speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
    voice = voices.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('natural'));
};

let transcript = '';

// Speech recognition event handler
speechRecognition.onresult = event => {
    transcript += event.results[event.results.length-1][0].transcript;
    userInput.value = transcript;
};

startBtn.addEventListener('click', e => {
    e.preventDefault(); // Prevent default behavior
    speechRecognition.start();
    startBtn.style.display = 'none'; // Hide start button
    stopBtn.style.display = 'block'; // Show stop button
});

stopBtn.addEventListener('click', e => {
    e.preventDefault(); // Prevent default behavior
    speechRecognition.stop();
    sendMessage();
    startBtn.style.display = 'block'; // Show start button
    stopBtn.style.display = 'none'; // Hide stop button
});


sendBtn.addEventListener('click', async e => {
    e.preventDefault();
    sendMessage()
});

const sendMessage = async () => {
    const userInputValue = transcript.trim(); // Trim the transcript
    if (userInputValue) { // Check if transcript is not empty
        try {
            const response = await fetch('http://localhost:3200/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userInputValue }),
            });
            const responseJSON = await response.json();
            const responseText = responseJSON.response;

            // Append message to chat log
            appendMessage('user', userInputValue);
            appendMessage('assistant', responseText);

            // Text-to-Speech
            // Clean up responseText
            const cleanText = responseText.replace(/```.+?```/gs, '').replace(/<[^>]*>?/gm, '').replace(/[^a-zA-Z0-9\s]/g, '');

            // Text-to-Speech
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.voice = voice;
            utterance.onstart = () => {
                shutUpBtn.style.display = 'block'; // Show shutup button
            };
            utterance.onend = () => {
                shutUpBtn.style.display = 'none'; // Hide shutup button
            };
            utterance.onerror = () => {
                shutUpBtn.style.display = 'none'; // Hide shutup button
            };
            speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Error sending request:', error);
        } finally {
            // Clear input and transcript
            userInput.value = '';
            transcript = '';
        }
    }
}

// Append message to chat log
function appendMessage(sender, text) {
    const messageHTML = `
    <div class="message ${sender}">
      <span class="sender">${sender}: </span>
      <span class="text">${parseMarkdown(text)}</span>
    </div>
  `;
    chatLog.insertAdjacentHTML('beforeend', messageHTML);
}

function parseMarkdown(text) {
    // Handle new lines
    text = text.replace(/\n/g, '<br>');

    // Handle lists
    text = text.replace(/^(-|\*) (.*)$/gm, '<li>$2</li>');
    text = text.replace(/^(#+) (.*)$/gm, '<h$1>$2</h$1>');

    // Handle code blocks
    text = text.replace(/```\n(.*?)\n```/gs, '<pre><code>$1</code></pre>');

    // Simple markdown parser, you can improve this
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
        .replace(/(\*\*|__)(.*?)\1/g, '<b>$2</b>')
        .replace(/(\*|_)(.*?)\1/g, '<i>$2</i>');
}

