const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('public'))

const controller = require('./controller')
const {testFunction} = controller

app.get('/', testFunction)

app.listen(4000, () => console.log('Server runing on port 4000'))