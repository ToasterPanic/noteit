const notes = []

$(".new-note div.text").on("input", (event) => {
    let text = $(".new-note div.text").text()

    if (text == "") {
        $(".new-note div.template-text").css("display", "block")
    } else {
        $(".new-note div.template-text").css("display", "none")
        
    }
})

function newElement(id) {
    let element = $(`<div class="note">
                    <div contenteditable="plaintext-only" class="text">I have 500 frogs and they are all named after me I love myself</div>
                    
                    <div class="button-bar">
                        <button class="pop-out">Pop Out</button>
                        <button class="delete">Delete</button>
                    </div>
                </div>`)

    
    element.attr("id", id)

    element.find("button.pop-out").on("click", (event) => {
        let index = notes.findIndex((item) => item.id == id)

        if (index) {
            notes = notes.splice(index, 1)
        }

        element.remove()
    })

    element.find("button.delete").on("click", (event) => {
        let index = notes.findIndex((item) => item.id == id)

        if (index) {
            notes = notes.splice(index, 1)
        }

        element.remove()
    })

    return element
}

$(".new-note button.create").on("click", (event) => {
    let note = {

    }

    note.creationDate = Date.now()
    note.content = $(".new-note div.text").text()
    note.id = 1

    notes.push(note)

    let element = newElement(note.id)
    
    element.attr("id", note.id)
    element.find(".text").text(note.content)

    $(".notes").append(element)
})

function updateNotes() {
    for (let i = 0; i < notes.length; ++i) {
        let note = notes[i]

        let element = $("div.note#" + note.id)

        if (!element) {
            let element = newElement(note.id)
    
            element.attr("id", note.id)
            element.find(".text").text(note.content)

            $(".notes").append(element)
        }
    }
}

updateNotes()