//Amicabotsi
const TeleBot = require('telebot');
var jp = require('jsonpath');

//Muuttujat
const rssurl = "http://www.amica.fi/modules/MenuRss/MenuRss/CurrentDay?costNumber=0083&language=fi"
var fs = require('fs');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

var schedule = require('node-schedule')

const adapter = new FileSync('data.json')
const db = low(adapter)

//BotToken
const bot = new TeleBot('TOKEN');

// Set some defaults
db.defaults({ users: [] })
    .write()

// Logaa jokaisen sisääntulevan viestin consoliin
bot.on('text', function (msg) {
    console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

//Komennot
bot.on('/start', (msg) => {
    var iid = msg.chat.id

    var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    var iideet = jp.query(obj, '$..id')

    for (i = 0; i < iideet.length; i += 1) {
        var iidee = iideet[i]
        if (iid == iidee) {
            console.log("Dataa ei tallenneta")
            return bot.sendMessage(msg.chat.id, `Hei, ${msg.from.first_name}! Saat tästä lähtien päivän safkat suoraan Telegramiin!`); //Vastaa kun käyttäjä käyttää /start komentoa
        } else {
            //älä tee mitää
        }
    }
    console.log("Data tallennetaan")
    // Data is automatically saved to localStorage
    db.get('users')
        .push({ id: iid })
        .write()

    return bot.sendMessage(msg.chat.id, `Hei, ${msg.from.first_name}! Saat tästä lähtien päivän safkat suoraan Telegramiin!`); //Vastaa kun käyttäjä käyttää /start komentoa
});

var j = schedule.scheduleJob('5 * * * *', function () {
    return bot.sendMessage(81023943, `Hei`)
    console.log('The answer to life, the universe, and everything!');
});

//Ohjelman pyöritys
bot.start();