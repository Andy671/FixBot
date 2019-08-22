const tmi = require('tmi.js')
const fs = require('fs')
const express = require('express')
const moment = require('moment')
const path = require('path')
const readLastLines = require('read-last-lines')
const countLinesInFile = require('count-lines-in-file')
const util = require('util');
const momentDurationFormatSetup = require("moment-duration-format")

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile)
const appendFile = util.promisify(fs.appendFile)
const writeFile = util.promisify(fs.writeFile)

const app = express()
const port = 3003

const oathtoken = fs.readFileSync('./credentials/oathtoken.pass', { encoding: 'utf8' })
const clientid = fs.readFileSync('./credentials/clientid.pass', { encoding: 'utf8' })
const channelid = 206290135
const maxNumOfLines = 15

const chatTxtPath = path.join(__dirname + '/chat.txt')
const chatHtmlPath = path.join(__dirname + '/chat.html')

const opts = {
  identity: {
    username: 'the_fix_bot',
    password: oathtoken
  },
  channels: [
    'unfixxxed'
  ]
}

app.get('/', async (req, res) => {
  let file = await readFile(chatHtmlPath, { encoding: 'utf8' })
  let chat_file = await readFile(chatTxtPath, { encoding: 'utf-8' })
  file = file.replace('REPLACE_ME', chat_file)
  res.send(file)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

var handleScreenChat = async (context, msg) => {
  let file = await readFile(chatTxtPath, { encoding: 'utf-8' })
  let message = `<b>${context['display-name']}</b>: ${msg}`
  let strings = splitter(message, 35)
  let phrase_str = '<div>'
  strings.forEach(str => {
    phrase_str += `<span>${str}</span>\n`
  })
  phrase_str += '</div>'
  let final_str = phrase_str + file
  let final_str_arr = final_str.split('\n')
  let numOfLines = final_str_arr.length
  if (numOfLines > maxNumOfLines) {
    final_str_arr = final_str_arr.slice(0, maxNumOfLines)
  }
  final_str = ''
  final_str_arr.forEach(element => {
    final_str += element + '\n'
  })

  writeFile(chatTxtPath, final_str, { encoding: 'utf-8' })
}

var splitter = (str, length) => {
  let strs = []
  while (str.length > length) {
    var pos = str.substring(0, length).lastIndexOf(' ');
    pos = pos <= 0 ? length : pos
    strs.push(str.substring(0, pos))
    var i = str.indexOf(' ', pos) + 1
    if (i < pos || i > pos + length)
      i = pos
    str = str.substring(i)
  }
  strs.push(str)
  return strs
}

// Called every time a message comes in
var onMessageHandler = (target, context, msg, self) => {
  handleScreenChat(context, msg)

  if (self) { return } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim()

  // If the command is known, let's execute it
  switch (commandName) {
    case '!github':
      client.say(target, 'https://github.com/Andy671')
      console.log(`* Executed ${commandName} command`)
      break
    case '!link':
      client.say(target, 'https://drumsmaker.com')
      console.log(`* Executed ${commandName} command`)
      break
    case '!info':
    case '!about':
      fs.readFile('./about.txt', { encoding: 'utf8' }, (err, text) => {
        client.say(target, text.toString())
        console.log(`* Executed ${commandName} command`)
      })
      break
    case '!uptime':
      client.api({
        url: 'https://api.twitch.tv/kraken/streams/' + channelid.toString(),
        headers: {
          'Client-ID': clientid
        }
      }, (err, res, body) => {
        let streamUptime = moment.duration(moment().diff(moment(body.stream.created_at)))
        let streamUptimeString = `Сегодня мы стримим уже ${streamUptime.format('hh:mm:ss')} B)`
        client.say(target, streamUptimeString)
        console.log(`* Executed ${commandName} command`)
      })
      break
    case '!help':
      fs.readFile('./help.txt', { encoding: 'utf8' }, (err, text) => {
        client.say(target, text.toString())
        console.log(`* Executed ${commandName} command`)
      })
      break
    default:
      console.log(`* Unknown command ${commandName}`)
      break
  }

}

// Called every time the bot connects to Twitch chat
var onConnectedHandler = (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`)
}

const client = new tmi.client(opts);

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

client.connect()

