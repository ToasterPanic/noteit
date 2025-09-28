const path = require('node:path')
const fs = require('node:fs')

const express = require('express')
const yaml = require("js-yaml")
const cookieParser = require('cookie-parser');

const app = express()
const config = yaml.load(fs.readFileSync("config.yaml"))

// Check if required userdata folders exist, and create them if not
if (!fs.existsSync("userdata")) {
    fs.mkdirSync("userdata")
}

// Cookie parser for cookie reading
app.use(cookieParser('my secret here'))

// Get request bodies
app.use(express.json())

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')))

// Config api path is used for max storage stuff mostly
app.get('/api/config', (req, res) => {
    res.json({
        maxNotesPerUser: config.maxNotesPerUser,
        maxKBPerUser: config.maxKBPerUser
    })
})

app.get('/api/get-all-note-ids', (req, res) => {
    let username = req.cookies.username
    let token = req.cookies.token

    if (username && token) {
        const userData = yaml.load(fs.readFileSync("userdata/" + username + "/usrconfig.yaml"))

        if (userData.token != token) {
            res.json({
                error: true,
                type: "incorrectToken"
            })

            return
        }

        const list = JSON.parse(fs.readFileSync("userdata/" + username + "/note-list.json"))

        res.json({
            success: true,
            data: JSON.stringify(list)
        })

        return
    }

    res.json({
        error: true
    })
})

app.get('/api/get-note/:noteId', (req, res) => {
    let username = req.cookies.username
    let token = req.cookies.token

    if (username && token) {
        const userData = yaml.load(fs.readFileSync("userdata/" + username + "/usrconfig.yaml"))

        if (userData.token != token) {
            res.json({
                error: true,
                type: "incorrectToken"
            })

            return
        }

        const note = fs.readFileSync("userdata/" + username + "/notes/" + req.params.noteId + ".json")

        res.json({
            success: true,
            data: JSON.parse(note)
        })

        return
    }

    res.json({
        error: true
    })
})

app.post('/api/edit-note/:noteId', (req, res) => {
    let username = req.cookies.username
    let token = req.cookies.token

    if (username && token) {
        const userData = yaml.load(fs.readFileSync("userdata/" + username + "/usrconfig.yaml"))
        const list = JSON.parse(fs.readFileSync("userdata/" + username + "/note-list.json"))

        req.body.lastEdited = Date.now()
        list[req.body.id] = req.body.lastEdited

        if (userData.token != token) {
            res.json({
                error: true,
                type: "incorrectToken"
            })

            return
        }

        try {
            console.log(req)
            if (!req.body?.id) {
                res.json({
                    error: true
                })

                return
            }
            fs.writeFileSync("userdata/" + username + "/notes/" + req.body.id + ".json", JSON.stringify(req.body), 'utf8');
            console.log('File written successfully synchronously.');
            fs.writeFileSync("userdata/" + username + "/note-list.json", JSON.stringify(list), 'utf8');

            res.json({
                success: true
            })
        } catch (error) {
            console.error('Error writing file:', error);

            res.json({
                error: true
            })
        }

        return
    }

    res.json({
        error: true,
        type: "missingCredentials"
    })
})

app.post('/api/delete-note/:noteId', (req, res) => {
    let username = req.cookies.username
    let token = req.cookies.token

    if (username && token) {
        const userData = yaml.load(fs.readFileSync("userdata/" + username + "/usrconfig.yaml"))

        if (userData.token != token) {
            res.json({
                error: true,
                type: "incorrectToken"
            })

            return
        }

        try {
            fs.unlinkSync("userdata/" + username + "/notes/" + req.params.noteId + ".json", req.body, 'utf8');
            console.log('File deleted successfully synchronously.');

            res.json({
                success: true
            })
        } catch (error) {
            console.error('Error deleting file:', error);

            res.json({
                error: true
            })
        }

        return
    }

    res.json({
        error: true
    })
})

app.post('/api/sign-in', (req, res) => {
    try {
        const userData = yaml.load(fs.readFileSync("userdata/" + req.body.username + "/usrconfig.yaml"))

        if (userData.password == req.body.password) {
            userData.token = (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16) + (Math.random() * 1e10).toString(16)

            res.cookie('username', req.body.username, { maxAge: ((60e3 * 60) * 24) * 14 })
            res.cookie('token', userData.token, { maxAge: (60e3 * 60) * 48 })

            res.json({
                success: true
            })
        }
    } catch (e) {
        res.json({
            error: true
        })
    }
})

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
})