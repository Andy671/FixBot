const tmi = require('tmi.js')
const fs = require('fs')
const express = require('express')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format")

const app = express()
const port = 3000

const oathtoken = fs.readFileSync('./credentials/oathtoken.pass', { encoding: 'utf8' })
const clientid = fs.readFileSync('./credentials/clientid.pass', { encoding: 'utf8' })
const channelid = 206290135
// Define configuration options
const opts = {
  identity: {
    username: 'the_fix_bot',
    password: oathtoken
  },
  channels: [
    'unfixxxed'
  ]
}

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


// Called every time a message comes in
var onMessageHandler = (target, context, msg, self) => {
  if (self) { return } // Ignore messages from the bot

  // let message = `<${context['display-name']}>: ${msg}`
  // let strings = splitter(message, 50)
  // let append_str = ''
  // strings.forEach(str => {
  //   append_str += str + '\n'
  // })

  // fs.appendFile('chat.txt', append_str + '\n', () => {
  //   console.log('Appended to file')
  // })

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

// Called every time the bot connects to Twitch chat
var onConnectedHandler = (addr, port) => {
  console.log(`* Connected to ${addr}:${port}`)
}

const client = new tmi.client(opts);

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

client.connect()

