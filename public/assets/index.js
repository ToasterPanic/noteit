let data = {
    notes: []
}
let storageUsed = 0
const windows = {}
const notesToPush = []
const notesToPull = []

// TODO: custom themes?
const themes = {
    "yellow": {
        color: "black",
        backgroundColor: "yellow"
    },
    "pink": {
        color: "black",
        backgroundColor: "#fa76ffff"
    },
    "purple": {
        color: "black",
        backgroundColor: "#b156dfff"
    },
    "blue": {
        color: "black",
        backgroundColor: "#599cb1ff"
    },
    "black": {
        color: "#ddd",
        backgroundColor: "#222"
    },
    "white": {
        color: "black",
        backgroundColor: "white"
    },
}

$(".new-note div.text").on("input", (event) => {
    let text = $(".new-note div.text").text()

    if (text == "") {
        $(".new-note div.template-text").css("display", "block")
    } else {
        $(".new-note div.template-text").css("display", "none")

    }
})

// Creates a new sticky note element, its hooks and other bits.
function newElement(id) {
    let element = $(`<div class="note">
                    <div contenteditable="plaintext-only" class="text">I have 500 frogs and they are all named after me I love myself</div>
                    
                    <div class="button-bar">
                        <button class="recolor">Recolor...</button>
                        <button class="delete">Delete</button>
                    </div>
                </div>`)

    element.attr("id", id)

    element.find("div.text").on("input", (event) => {
        let note = data.notes.find((item) => item.id == id)

        if (!note) return;

        note.content = element.find("div.text").text()

        notesToPush.push(id)
    })

    // This functionality was originally going to be added to this, but I don't want to spend time on it
    // I think it would be cool, but it would also probably be a pain to implement at the moment
    // Reconsider later
    element.find("button.pop-out").on("click", (event) => {
        let note = data.notes.find((item) => item.id == id)
        element.css("display", "none")

        var noteWindow = window.open("", note.id, "width=300,height=180,status=no,toolbar=no")

        // By no means the prettiest nor best solution, but it works!
        noteWindow.document.write(`<!DOCTYPE html>
<html>
    <head>
        <title>Note</title>

        <link rel="stylesheet" href="/assets/note.css">
    </head>
    <body>
        <div class="content">
            ${note.content}
        </div>
    </body>
</html>`)

        windows[id] = noteWindow
    })

    element.find("button.recolor").on("click", (event) => {
        let note = data.notes.find((item) => item.id == id)

        if (note) {
            note.theme = (note.theme == "purple") ? "yellow" : "purple"
        }

        notesToPush.push(id)

        element.css({
            "background-color": themes[note.theme].backgroundColor,
            "color": themes[note.theme].color
        })
    })

    element.find("button.delete").on("click", (event) => {
        let index = data.notes.findIndex((item) => item.id == id)

        if (index != -1) {
            data.notes.splice(index, 1)
        }

        $.post("/api/delete-note/" + id, {})

        element.remove()
    })

    return element
}

function newId() {
    let id = ""
    let success = false

    while (!success) {
        id = (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16)

        id = id.replaceAll(".", "-")

        let found = data.notes.find((v) => v.id == id)

        if (!found) {
            success = true
        }
    }

    return id
}

$(".new-note button.create").on("click", (event) => {
    let note = {
        creationDate: Date.now(),
        content: $(".new-note div.text").text(),
        id: newId(),
        theme: "yellow"
    }

    data.notes.push(note)

    let element = newElement(note.id)

    element.attr("id", note.id)
    element.find(".text").text(note.content)

    element.css({
        "background-color": themes[note.theme].backgroundColor,
        "color": themes[note.theme].color
    })

    notesToPush.push(note.id)

    $(".notes").append(element)
})

$(".popup.sign-in .submit").on("click", (event) => {
    $.ajax({
        url: "/api/sign-in", // Replace with your actual API endpoint
        type: "POST",
        data: JSON.stringify({
            username: $(".popup.sign-in .username").val(),
            password: $(".popup.sign-in .password").val()
        }),
        contentType: "application/json",
        dataType: "json"
    })
        .done((body) => {
        if (body.success) {
            document.location.reload()
        } else {
            alert("Failed to sign in. Check if you typed your info in correctly, then try again.")
        }
    })
})

// Updates notes, creating element for those who don't have one.
function updateNotes() {
    for (let i = 0; i < data.notes.length; ++i) {
        let note = data.notes[i]

        let element = $("div.note#" + note.id)

        if (element.length < 1) {
            let element = newElement(note.id)

            element.attr("id", note.id)
            element.find(".text").text(note.content)

            element.css({
                "background-color": themes[note.theme].backgroundColor,
                "color": themes[note.theme].color
            })

            $(".notes").append(element)
        }
    }
}

window.onbeforeunload = function () {
    let windowValues = Object.keys(windows)
    for (let i = 0; i < windowValues.length; ++i) {
        windowValues.close()
    }
}

// Load local storage items
let newData = localStorage.getItem("data")

if (newData) {
    data = JSON.parse(newData)
}

function refresh() {
    // Start syncing notes now
    $.get("/api/get-all-note-ids", {})
        .done((body) => {
            if (body.success) {
                body.data = JSON.parse(body.data)
                let keys = Object.keys(body.data)
                for (let i = 0; i < keys.length; ++i) {
                    let id = keys[i]

                    let note = data.notes.find((item) => item.id == id)

                    if (
                        (!note) ||
                        (note.lastEdited < body.data[id]) ||
                        (!note.lastEdited)
                    ) {
                        let element = $("div.note#" + id)

                        if (element.length > 0) {
                            element.remove()
                        }

                        $.get("/api/get-note/" + id, {})
                            .done((body) => {
                                if (body.success) {
                                    let index = data.notes.findIndex((item) => item.id == id)
                                    if (index != -1) {
                                        data.notes.splice(index, 1)
                                    }
                                    data.notes.push(body.data)
                                }
                            })
                    }
                }
            }

        })
}

refresh()

// Check if signed in and update accordingly

if (document.cookie.indexOf('username=') != -1) {
    $(".account-status div.text").text("Sign in to sync")
}

if (document.cookie.indexOf('token=') != -1) {
    $(".account-status div.text").text("Signed in")
}

// Automatic interval, for saving data, caluclating storage, etc.
function interval() {
    let text = JSON.stringify(data)

    storageUsed = text.length / 1024

    $(".space-taken").text(Math.round(storageUsed))
    $(".notes-taken").text(data.notes.length)

    localStorage.setItem("data", text)

    for (let i = 0; i < notesToPush.length; ++i) {
        let id = notesToPush[i]

        let note = data.notes.find((item) => item.id == id)

        $.ajax({
            url: "/api/edit-note/" + id, // Replace with your actual API endpoint
            type: "POST",
            data: JSON.stringify(note),
            contentType: "application/json",
            dataType: "json"
        })
            .done((body) => {
                if (body.success) {
                }
            })
    }

    notesToPush.splice(0)

    updateNotes()
}

setInterval(interval, 0.5e3)

interval()