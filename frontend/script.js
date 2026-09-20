/* =========================================
   STORAGE KEYS
========================================= */

const HISTORY_KEY =
    "harshvardh_resume_chat_history";

const CURRENT_CHAT_KEY =
    "harshvardh_resume_current_chat";

const THEME_KEY =
    "harshvardh_resume_theme";


/* =========================================
   DOM ELEMENTS
========================================= */

const questionInput =
    document.getElementById("question");

const sendBtn =
    document.getElementById("send-btn");

const sendIcon =
    document.getElementById("send-icon");

const chatBox =
    document.getElementById("chat-box");

const welcomeMessage =
    document.getElementById("welcome-message");

const historyContainer =
    document.getElementById("history-container");

const searchInput =
    document.getElementById("search-input");

const newChatBtn =
    document.getElementById("new-chat-btn");

const clearBtn =
    document.getElementById("clear-btn");

const themeBtn =
    document.getElementById("theme-btn");

const headerThemeBtn =
    document.getElementById("header-theme-btn");

const themeIcon =
    document.getElementById("theme-icon");

const themeText =
    document.getElementById("theme-text");

const menuBtn =
    document.getElementById("menu-btn");

const closeSidebarBtn =
    document.getElementById("close-sidebar-btn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");

const scrollBtn =
    document.getElementById("scroll-btn");


/* =========================================
   APPLICATION STATE
========================================= */

let currentConversation = null;

let isGenerating = false;


/* =========================================
   LOCAL STORAGE
========================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(HISTORY_KEY)
        ) || [];

    } catch (error) {

        console.error(
            "Could not load chat history:",
            error
        );

        return [];
    }
}


function saveHistory(history) {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


function saveCurrentConversation() {

    if (!currentConversation) {
        return;
    }

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        JSON.stringify(currentConversation)
    );
}


/* =========================================
   CREATE NEW CONVERSATION
========================================= */

function createConversation() {

    return {

        id: crypto.randomUUID(),

        title: "New Chat",

        createdAt: Date.now(),

        updatedAt: Date.now(),

        messages: []

    };
}


/* =========================================
   INIT
========================================= */

function initializeApp() {

    loadTheme();

    loadCurrentConversation();

    renderHistory();

    setupAutoResize();

    setupScrollDetection();

    questionInput.focus();
}


function loadCurrentConversation() {

    try {

        const saved =
            localStorage.getItem(
                CURRENT_CHAT_KEY
            );

        if (saved) {

            const conversation =
                JSON.parse(saved);

            if (
                conversation &&
                conversation.id
            ) {

                currentConversation =
                    conversation;

                renderConversation(
                    currentConversation.messages
                );

                return;
            }
        }

    } catch (error) {

        console.error(
            "Could not load current chat:",
            error
        );
    }


    currentConversation =
        createConversation();

    renderConversation([]);
}


/* =========================================
   NEW CHAT
========================================= */

function startNewChat() {

    if (isGenerating) {
        return;
    }


    archiveCurrentConversation();


    currentConversation =
        createConversation();


    saveCurrentConversation();

    renderConversation([]);

    renderHistory();

    closeSidebar();

    questionInput.focus();
}


/* =========================================
   ARCHIVE CURRENT CHAT
========================================= */

function archiveCurrentConversation() {

    if (!currentConversation) {
        return;
    }


    if (
        !currentConversation.messages ||
        currentConversation.messages.length === 0
    ) {

        return;
    }


    const history =
        getHistory();


    const existingIndex =
        history.findIndex(
            chat =>
                chat.id === currentConversation.id
        );


    currentConversation.updatedAt =
        Date.now();


    if (existingIndex !== -1) {

        history[existingIndex] =
            currentConversation;

    } else {

        history.unshift(
            currentConversation
        );
    }


    saveHistory(history);
}


/* =========================================
   RENDER HISTORY
========================================= */

function renderHistory() {

    const history =
        getHistory();

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    let filteredHistory =
        history;


    if (searchTerm) {

        filteredHistory =
            history.filter(
                conversation =>
                    conversation.title
                        .toLowerCase()
                        .includes(searchTerm)
            );
    }


    historyContainer.innerHTML = "";


    if (filteredHistory.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "history-empty";

        empty.textContent =
            searchTerm
                ? "No chats found"
                : "No previous chats";

        historyContainer.appendChild(empty);

        return;
    }


    const groups =
        groupHistory(
            filteredHistory
        );


    Object.entries(groups)
        .forEach(
            ([groupName, conversations]) => {

                if (
                    conversations.length === 0
                ) {
                    return;
                }


                const section =
                    document.createElement(
                        "div"
                    );

                section.className =
                    "history-section";


                const title =
                    document.createElement(
                        "div"
                    );

                title.className =
                    "history-title";

                title.textContent =
                    groupName;


                section.appendChild(title);


                conversations.forEach(
                    conversation => {

                        section.appendChild(
                            createHistoryRow(
                                conversation
                            )
                        );

                    }
                );


                historyContainer.appendChild(
                    section
                );

            }
        );
}


/* =========================================
   GROUP HISTORY
========================================= */

function groupHistory(history) {

    const now =
        Date.now();

    const oneDay =
        24 * 60 * 60 * 1000;


    const groups = {

        "Today": [],

        "Previous 7 days": [],

        "Older": []

    };


    history.forEach(
        conversation => {

            const age =
                now -
                conversation.updatedAt;


            if (age < oneDay) {

                groups["Today"].push(
                    conversation
                );

            } else if (
                age < oneDay * 7
            ) {

                groups["Previous 7 days"].push(
                    conversation
                );

            } else {

                groups["Older"].push(
                    conversation
                );
            }

        }
    );


    return groups;
}


/* =========================================
   HISTORY ROW
========================================= */

function createHistoryRow(
    conversation
) {

    const row =
        document.createElement("div");

    row.className =
        "history-row";


    if (
        currentConversation &&
        currentConversation.id ===
        conversation.id
    ) {

        row.classList.add("active");
    }


    const title =
        document.createElement("div");

    title.className =
        "history-title-text";

    title.textContent =
        conversation.title ||
        "New Chat";


    row.appendChild(title);


    const menuButton =
        document.createElement("button");

    menuButton.className =
        "history-menu-btn";

    menuButton.textContent =
        "•••";

    menuButton.title =
        "Chat options";


    menuButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showHistoryMenu(
                row,
                conversation
            );

        }
    );


    row.appendChild(
        menuButton
    );


    row.addEventListener(
        "click",
        () => {

            openHistoryChat(
                conversation.id
            );

        }
    );


    return row;
}


/* =========================================
   HISTORY MENU
========================================= */

function showHistoryMenu(
    row,
    conversation
) {

    closeAllHistoryMenus();


    const menu =
        document.createElement("div");

    menu.className =
        "history-menu";


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-option";

    deleteButton.textContent =
        "Delete chat";


    deleteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            deleteConversation(
                conversation.id
            );

        }
    );


    menu.appendChild(
        deleteButton
    );


    row.appendChild(menu);


    setTimeout(
        () => {

            document.addEventListener(
                "click",
                closeAllHistoryMenus,
                {
                    once: true
                }
            );

        },
        0
    );
}


function closeAllHistoryMenus() {

    document
        .querySelectorAll(
            ".history-menu"
        )
        .forEach(
            menu => menu.remove()
        );
}


/* =========================================
   OPEN HISTORY CHAT
========================================= */

function openHistoryChat(
    conversationId
) {

    if (isGenerating) {
        return;
    }


    const history =
        getHistory();


    const conversation =
        history.find(
            chat =>
                chat.id === conversationId
        );


    if (!conversation) {
        return;
    }


    /*
       IMPORTANT:

       We now make the selected history
       conversation the CURRENT conversation.

       This fixes the old-chat continuation bug.
    */

    currentConversation =
        JSON.parse(
            JSON.stringify(
                conversation
            )
        );


    saveCurrentConversation();


    renderConversation(
        currentConversation.messages
    );


    renderHistory();

    closeSidebar();

    questionInput.focus();
}


/* =========================================
   DELETE CONVERSATION
========================================= */

function deleteConversation(
    conversationId
) {

    closeAllHistoryMenus();


    const history =
        getHistory();


    const updatedHistory =
        history.filter(
            conversation =>
                conversation.id !==
                conversationId
        );


    saveHistory(
        updatedHistory
    );


    if (
        currentConversation &&
        currentConversation.id ===
        conversationId
    ) {

        currentConversation =
            createConversation();

        saveCurrentConversation();

        renderConversation([]);
    }


    renderHistory();
}


/* =========================================
   RENDER CONVERSATION
========================================= */

function renderConversation(
    messages
) {

    chatBox.innerHTML = "";


    if (
        !messages ||
        messages.length === 0
    ) {

        showWelcome();

        return;
    }


    messages.forEach(
        message => {

            /*
               Backend history contains
               user messages with large
               context strings.

               For the frontend we only
               store/display clean messages.
            */

            addMessageToUI(
                message.role,
                message.displayContent ||
                message.content ||
                "",
                false
            );

        }
    );


    scrollToBottom();
}


/* =========================================
   SHOW WELCOME
========================================= */

function showWelcome() {

    chatBox.innerHTML = "";


    const welcome =
        document.createElement("div");

    welcome.className =
        "welcome-message";

    welcome.id =
        "welcome-message";


    welcome.innerHTML = `

        <div class="welcome-icon">
            AI
        </div>

        <h2>
            Hi, I'm Harshvardh's Resume Assistant
        </h2>

        <p>
            Ask me anything about my skills,
            projects, education, experience,
            or professional background.
        </p>

        <div class="suggestions">

            <button class="suggestion">
                <span class="suggestion-icon">
                    💼
                </span>
                <span>
                    What are his skills?
                </span>
            </button>

            <button class="suggestion">
                <span class="suggestion-icon">
                    🚀
                </span>
                <span>
                    Tell me about his projects
                </span>
            </button>

            <button class="suggestion">
                <span class="suggestion-icon">
                    🎓
                </span>
                <span>
                    What is his education?
                </span>
            </button>

            <button class="suggestion">
                <span class="suggestion-icon">
                    👨‍💻
                </span>
                <span>
                    Tell me about his experience
                </span>
            </button>

        </div>
    `;


    chatBox.appendChild(
        welcome
    );


    setupSuggestionButtons();
}


/* =========================================
   ADD MESSAGE TO UI
========================================= */

function addMessageToUI(
    role,
    content,
    scroll = true
) {

    if (
        !content &&
        role !== "assistant"
    ) {

        return;
    }


    const message =
        document.createElement("div");


    message.className =
        `message ${
            role === "user"
                ? "user-message"
                : "ai-message"
        }`;


    if (role === "user") {


        const messageContent =
            document.createElement("div");


        messageContent.className =
            "message-content";


        messageContent.textContent =
            content;


        message.appendChild(
            messageContent
        );


    } else {


        const avatar =
            document.createElement("div");


        avatar.className =
            "ai-avatar";

        avatar.textContent =
            "AI";


        const wrapper =
            document.createElement("div");


        wrapper.className =
            "ai-message-content-wrapper";


        const messageContent =
            document.createElement("div");


        messageContent.className =
            "message-content";


        messageContent.innerHTML =
            safeMarkdown(content);


        wrapper.appendChild(
            messageContent
        );


        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";


        const copyButton =
            document.createElement("button");

        copyButton.className =
            "message-action";

        copyButton.textContent =
            "⧉";

        copyButton.title =
            "Copy";


        copyButton.addEventListener(
            "click",
            () => {

                copyText(
                    content,
                    copyButton
                );

            }
        );


        const regenerateButton =
            document.createElement("button");

        regenerateButton.className =
            "message-action";

        regenerateButton.textContent =
            "↻";

        regenerateButton.title =
            "Regenerate";


        regenerateButton.addEventListener(
            "click",
            () => {

                regenerateLastAnswer();

            }
        );


        actions.appendChild(
            copyButton
        );

        actions.appendChild(
            regenerateButton
        );


        wrapper.appendChild(
            actions
        );


        message.appendChild(
            avatar
        );

        message.appendChild(
            wrapper
        );
    }


    chatBox.appendChild(
        message
    );


    if (scroll) {

        scrollToBottom();
    }


    return message;
}


/* =========================================
   SAFE MARKDOWN
========================================= */

function safeMarkdown(
    text
) {

    const html =
        marked.parse(
            text || ""
        );


    return DOMPurify.sanitize(
        html
    );
}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage(
    question
) {

    question =
        question.trim();


    if (
        !question ||
        isGenerating
    ) {

        return;
    }


    isGenerating = true;

    sendBtn.disabled = true;


    /* =================================
       REMOVE WELCOME
    ================================= */

    const welcome =
        document.getElementById(
            "welcome-message"
        );


    if (welcome) {

        welcome.remove();
    }


    /* =================================
       SAVE USER MESSAGE
    ================================= */

    currentConversation.messages.push({

        role: "user",

        content: question,

        displayContent: question

    });


    /*
       First message becomes chat title.
    */

    if (
        currentConversation.title ===
        "New Chat"
    ) {

        currentConversation.title =
            createChatTitle(question);
    }


    currentConversation.updatedAt =
        Date.now();


    saveCurrentConversation();


    /* =================================
       DISPLAY USER MESSAGE
    ================================= */

    addMessageToUI(
        "user",
        question
    );


    /* =================================
       AI MESSAGE CONTAINER
    ================================= */

    const aiMessage =
        document.createElement("div");

    aiMessage.className =
        "message ai-message";


    const avatar =
        document.createElement("div");

    avatar.className =
        "ai-avatar";

    avatar.textContent =
        "AI";


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "ai-message-content-wrapper";


    const aiContent =
        document.createElement("div");

    aiContent.className =
        "message-content";


    aiContent.innerHTML = `

        <div class="loading">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    wrapper.appendChild(
        aiContent
    );


    aiMessage.appendChild(
        avatar
    );

    aiMessage.appendChild(
        wrapper
    );


    chatBox.appendChild(
        aiMessage
    );


    scrollToBottom();


    /* =================================
       API REQUEST
    ================================= */

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            question,

                        conversation_id:
                            currentConversation.id

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        if (!response.body) {

            throw new Error(
                "Streaming response is not available."
            );
        }


        /* =================================
           STREAM
        ================================= */

        const reader =
            response.body.getReader();


        const decoder =
            new TextDecoder();


        let answer = "";

        let firstChunk = true;


        while (true) {

            const {
                value,
                done
            } =
                await reader.read();


            if (done) {

                break;
            }


            const chunk =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            if (!chunk) {
                continue;
            }


            if (firstChunk) {

                aiContent.innerHTML =
                    "";

                firstChunk = false;
            }


            answer += chunk;


            aiContent.innerHTML =
                safeMarkdown(
                    answer
                );


            scrollToBottom();
        }


        /* =================================
           SAVE AI MESSAGE
        ================================= */

        currentConversation.messages.push({

            role: "assistant",

            content: answer,

            displayContent: answer

        });


        currentConversation.updatedAt =
            Date.now();


        saveCurrentConversation();

        archiveCurrentConversation();

        renderHistory();


        /* =================================
           ACTION BUTTONS
        ================================= */

        addMessageActions(
            wrapper,
            answer
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        const errorMessage =
            "Sorry, I couldn't connect to the AI backend.";


        aiContent.textContent =
            errorMessage;


        currentConversation.messages.push({

            role: "assistant",

            content: errorMessage,

            displayContent: errorMessage

        });


        currentConversation.updatedAt =
            Date.now();


        saveCurrentConversation();
    }


    /* =================================
       FINISH
    ================================= */

    isGenerating = false;

    sendBtn.disabled = false;

    questionInput.focus();
}


/* =========================================
   MESSAGE ACTIONS
========================================= */

function addMessageActions(
    wrapper,
    answer
) {

    const oldActions =
        wrapper.querySelector(
            ".message-actions"
        );


    if (oldActions) {

        oldActions.remove();
    }


    const actions =
        document.createElement("div");

    actions.className =
        "message-actions";


    const copyButton =
        document.createElement("button");

    copyButton.className =
        "message-action";

    copyButton.textContent =
        "⧉";

    copyButton.title =
        "Copy";


    copyButton.addEventListener(
        "click",
        () => {

            copyText(
                answer,
                copyButton
            );

        }
    );


    const regenerateButton =
        document.createElement("button");

    regenerateButton.className =
        "message-action";

    regenerateButton.textContent =
        "↻";

    regenerateButton.title =
        "Regenerate";


    regenerateButton.addEventListener(
        "click",
        () => {

            regenerateLastAnswer();

        }
    );


    actions.appendChild(
        copyButton
    );

    actions.appendChild(
        regenerateButton
    );


    wrapper.appendChild(
        actions
    );
}


/* =========================================
   COPY
========================================= */

async function copyText(
    text,
    button
) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        const oldText =
            button.textContent;


        button.textContent =
            "✓";


        setTimeout(
            () => {

                button.textContent =
                    oldText;

            },
            1200
        );


    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );
    }
}


/* =========================================
   REGENERATE
========================================= */

async function regenerateLastAnswer() {

    if (
        isGenerating ||
        !currentConversation
    ) {

        return;
    }


    const messages =
        currentConversation.messages;


    if (
        messages.length < 2
    ) {

        return;
    }


    const lastMessage =
        messages[messages.length - 1];


    const previousMessage =
        messages[messages.length - 2];


    if (
        lastMessage.role !== "assistant" ||
        previousMessage.role !== "user"
    ) {

        return;
    }


    const question =
        previousMessage.displayContent ||
        previousMessage.content;


    /*
       Remove the previous AI answer
       from the conversation.
    */

    currentConversation.messages.pop();


    /*
       Remove the old AI UI message.
    */

    const aiMessages =
        chatBox.querySelectorAll(
            ".ai-message"
        );


    const lastAiMessage =
        aiMessages[
            aiMessages.length - 1
        ];


    if (lastAiMessage) {

        lastAiMessage.remove();
    }


    /*
       Remove the previous user UI message
       because sendMessage() will create it again.
    */

    const userMessages =
        chatBox.querySelectorAll(
            ".user-message"
        );


    const lastUserMessage =
        userMessages[
            userMessages.length - 1
        ];


    if (lastUserMessage) {

        lastUserMessage.remove();
    }


    saveCurrentConversation();


    await sendMessage(
        question
    );
}


/* =========================================
   CHAT TITLE
========================================= */

function createChatTitle(
    question
) {

    let title =
        question.trim();


    if (
        title.length > 35
    ) {

        title =
            title.substring(
                0,
                35
            ) + "...";
    }


    return title;
}


/* =========================================
   CLEAR CURRENT CHAT
========================================= */

function clearCurrentChat() {

    if (isGenerating) {
        return;
    }


    currentConversation =
        createConversation();


    saveCurrentConversation();


    renderConversation([]);

    renderHistory();

    questionInput.focus();
}


/* =========================================
   THEME
========================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );
    }


    updateThemeUI();
}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        THEME_KEY,
        isDark
            ? "dark"
            : "light"
    );


    updateThemeUI();
}


function updateThemeUI() {

    const isDark =
        document.body.classList.contains(
            "dark"
        );


    themeIcon.textContent =
        isDark
            ? "☀️"
            : "🌙";


    themeText.textContent =
        isDark
            ? "Light mode"
            : "Dark mode";


    headerThemeBtn.textContent =
        isDark
            ? "☀️"
            : "🌙";
}


/* =========================================
   SUGGESTIONS
========================================= */

function setupSuggestionButtons() {

    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const question =
                            button
                                .querySelector(
                                    "span:last-child"
                                )
                                .textContent
                                .trim();


                        sendMessage(
                            question
                        );

                    }
                );

            }
        );
}


/* =========================================
   TEXTAREA AUTO RESIZE
========================================= */

function setupAutoResize() {

    questionInput.addEventListener(
        "input",
        () => {

            questionInput.style.height =
                "auto";


            questionInput.style.height =
                Math.min(
                    questionInput.scrollHeight,
                    120
                ) + "px";

        }
    );
}


/* =========================================
   ENTER KEY
========================================= */

questionInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            const question =
                questionInput.value;


            questionInput.value =
                "";

            questionInput.style.height =
                "auto";


            sendMessage(
                question
            );
        }
    }
);


/* =========================================
   SEND BUTTON
========================================= */

sendBtn.addEventListener(
    "click",
    () => {

        const question =
            questionInput.value;


        questionInput.value =
            "";

        questionInput.style.height =
            "auto";


        sendMessage(
            question
        );
    }
);


/* =========================================
   NEW CHAT
========================================= */

newChatBtn.addEventListener(
    "click",
    startNewChat
);


/* =========================================
   CLEAR
========================================= */

clearBtn.addEventListener(
    "click",
    clearCurrentChat
);


/* =========================================
   THEME BUTTONS
========================================= */

themeBtn.addEventListener(
    "click",
    toggleTheme
);


headerThemeBtn.addEventListener(
    "click",
    toggleTheme
);


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    renderHistory
);


/* =========================================
   SCROLL DETECTION
========================================= */

function setupScrollDetection() {

    chatBox.addEventListener(
        "scroll",
        () => {

            const distanceFromBottom =
                chatBox.scrollHeight -
                chatBox.scrollTop -
                chatBox.clientHeight;


            if (
                distanceFromBottom > 300
            ) {

                scrollBtn.classList.remove(
                    "hidden"
                );

            } else {

                scrollBtn.classList.add(
                    "hidden"
                );
            }

        }
    );
}


/* =========================================
   SCROLL TO BOTTOM
========================================= */

function scrollToBottom() {

    requestAnimationFrame(
        () => {

            chatBox.scrollTop =
                chatBox.scrollHeight;

        }
    );
}


scrollBtn.addEventListener(
    "click",
    scrollToBottom
);


/* =========================================
   MOBILE SIDEBAR
========================================= */

function openSidebar() {

    sidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.add(
        "visible"
    );
}


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "visible"
    );
}


menuBtn.addEventListener(
    "click",
    openSidebar
);


closeSidebarBtn.addEventListener(
    "click",
    closeSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


/* =========================================
   CLOSE MENU WITH ESC
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAllHistoryMenus();

            closeSidebar();
        }

    }
);


/* =========================================
   START APPLICATION
========================================= */

setupSuggestionButtons();

initializeApp();