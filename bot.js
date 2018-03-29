//Pysäkkibot
const TeleBot = require('telebot');
var jp = require('jsonpath');

//Muuttujat
const rssurl = "http://www.amica.fi/modules/MenuRss/MenuRss/CurrentDay?costNumber=0083&language=fi"
var fs = require('fs');

//BotToken
const bot = new TeleBot('311203916:AAHum5kqB9AqBkRQdEQ-uSPMkOLnqmqDJbg');


//Komennot
bot.on('/start', (msg) => {
    console.log(msg.chat.id)
    
    if (msg.chat.id == 81023943 ) {
        //Do nothing
    }else{
        fs.appendFile("db/db.txt", msg.chat.id + "\n")
    }
    return bot.sendMessage(msg.from.id, `Hei, ${msg.from.first_name}! Saat tästä lähtien päivän safkat suoraan Telegramiin!`); //Vastaa kun käyttäjä käyttää /start komentoa
});



// Logaa jokaisen sisääntulevan viestin consoliin
bot.on('text', function (msg) {
    console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

//Ohjelman pyöritys
bot.start();