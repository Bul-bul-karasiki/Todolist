let count = 1;
let list = document.getElementById("todolist");
let draggedItem = null;

function saveTodos() {
    const todos = [];
    document.querySelectorAll("#todolist li").forEach(li => {
        const span = li.querySelector("span");
        todos.push({ id: li.id, text: span ? span.textContent : li.textContent });
    });
    localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(todo => {
        const li = createTodoElement(todo.text, todo.id);
        list.append(li);
        li.style.animation = "fadeIn 0.3s ease forwards"; // анімація при завантаженні
    });
    if (todos.length > 0) count = todos.length + 1;
}

function createTodoElement(text, id = null) {
    const li = document.createElement("li");
    li.id = id || `Item${count}`;
    li.style.opacity = "0";
    li.style.animation = "fadeIn 0.3s ease forwards"; // анімація додавання

    const span = document.createElement("span");
    span.style.whiteSpace = "pre-wrap";
    span.textContent = text;

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.classList.add("save-btn");

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const textarea = document.createElement("textarea");
        textarea.classList.add("editing");
        textarea.value = span.textContent;

        li.innerHTML = "";
        li.append(textarea, saveBtn);
        textarea.focus();

        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (event.shiftKey) {
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(cursorPos);
                    textarea.value = textBefore + "\n" + textAfter;
                    textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
                    event.preventDefault();
                } else {
                    saveBtn.click();
                }
            }
        });

        saveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const newText = textarea.value;
            if (newText !== "") {
                span.textContent = newText;
                li.innerHTML = "";
                li.append(span, editBtn);
                saveTodos();
            } else {
                textarea.focus();
            }
        });
    });

    li.append(span, editBtn);

    li.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON" && !li.querySelector("textarea")) {
            li.style.textDecoration = 'line-through';
            li.style.animation = "fadeOut 0.5s ease forwards"; // анімація видалення
            setTimeout(() => {
                li.remove();
                saveTodos();
            }, 500);
        }
    });

    li.draggable = true;
    li.addEventListener("dragstart", (e) => {
        draggedItem = e.target;
        e.target.classList.add("dragging");
    });

    li.addEventListener("dragend", (e) => {
        e.target.classList.remove("dragging");
        draggedItem = null;
        saveTodos();
    });

    return li;
}

function add() {
    const textarea = document.getElementById("text");
    const text = textarea.value;

    if (text !== "") {
        const li = createTodoElement(text);
        list.append(li);
        count++;
        saveTodos();
    }
    textarea.value = "";
    textarea.focus();
}

const textareaInput = document.getElementById("text");
textareaInput.addEventListener("keydown", function(e) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (e.key === "Enter") {
        if (isMobile) {
            const cursorPos = this.selectionStart;
            const textBefore = this.value.substring(0, cursorPos);
            const textAfter = this.value.substring(cursorPos);
            this.value = textBefore + "\n" + textAfter;
            this.selectionStart = this.selectionEnd = cursorPos + 1;
            e.preventDefault();
        } else {
            if (e.shiftKey) {
                const cursorPos = this.selectionStart;
                const textBefore = this.value.substring(0, cursorPos);
                const textAfter = this.value.substring(cursorPos);
                this.value = textBefore + "\n" + textAfter;
                this.selectionStart = this.selectionEnd = cursorPos + 1;
                e.preventDefault();
            } else {
                e.preventDefault();
                add();
            }
        }
    }
});

list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const closest = e.target.closest("li");
    if (!closest || closest === draggedItem) return;
    const rect = closest.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    if (offset > rect.height / 2) {
        closest.after(draggedItem);
    } else {
        closest.before(draggedItem);
    }
});

window.addEventListener("load", loadTodos);

const inputArea = document.getElementById("text");
const overlay = document.getElementById("textAnimatedOverlay");

let oldText = "";

inputArea.addEventListener("input", () => {
    const newText = inputArea.value;

    overlay.innerHTML = "";

    for (let i = 0; i < newText.length; i++) {
        const char = document.createElement("span");
        char.textContent = newText[i];

        if (i >= oldText.length || newText[i] !== oldText[i]) {
            char.style.animation = "fadeInChar 0.15s ease forwards";
        }

        overlay.appendChild(char);
    }

    if (newText.length < oldText.length) {
        for (let j = newText.length; j < oldText.length; j++) {
            const removedChar = document.createElement("span");
            removedChar.textContent = oldText[j];
            removedChar.style.animation = "fadeOutChar 0.15s ease forwards";
            removedChar.style.position = "absolute";
            removedChar.style.opacity = "0";
            overlay.appendChild(removedChar);
        }
    }

    oldText = newText;
});
