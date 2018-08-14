//
// Fazer Food & Co Pääraide bot
//

const TeleBot = require('telebot');
var jp = require('jsonpath');

//Muuttujat
const rssurl = "https://www.fazerfoodco.fi/modules/MenuRss/MenuRss/CurrentDay?costNumber=0083&language=fi"
const rssurlviikko = "https://www.fazerfoodco.fi/modules/MenuRss/MenuRss/CurrentWeek?costNumber=0083&language=fi"
var fs = require('fs');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var schedule = require('node-schedule')
const adapter = new FileSync('data.json')
const dbjson = low(adapter)
//Rss parser
let Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
        item: ['title', 'description'],
    }
});

//BotToken
const bot = new TeleBot('TOKEN');

// Set some defaults
dbjson.defaults({ users: [] })
    .write()

//Aikaleimat logiin
require('console-stamp')(console, 'HH:MM:ss'); 
// Logaa jokaisen sisääntulevan viestin consoliin
bot.on('text', function (msg) {
    console.log(`[text] ${msg.chat.id} ${msg.text}`);
});

//Komennot

// /start
bot.on('/start', (msg) => {
    //iid = chatin ID
    var iid = msg.chat.id

    //Hakee data.jsonin
    var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    //Ettii data.jsonista kaikki ID:t
    var iideet = jp.query(obj, '$..id')

    //Jokainen id käydään läpi ja tarkistetaan onko samaa id:tä jo rekisteröity
    for (i = 0; i < iideet.length; i += 1) {
        var iidee = iideet[i]
        if (iid == iidee) {
            console.log("Dataa ei tallenneta")
            return bot.sendMessage(msg.chat.id, `Hei, ${msg.from.first_name}! Saat tästä lähtien päivän safkat suoraan Telegramiin!\n\nVoit lopettaa tilauksen tekemällä /stop.`); //Vastaa kun käyttäjä käyttää /start komentoa
        } else {
            //älä tee mitää
        }
    }
    console.log("Data tallennetaan")
    // Data is automatically saved to localStorage
    dbjson.get('users')
        .push({ id: iid })
        .write()

    return bot.sendMessage(msg.chat.id, `Hei, ${msg.from.first_name}! Saat tästä lähtien päivän safkat suoraan Telegramiin!\n\nVoit lopettaa tilauksen tekemällä /stop.`); //Vastaa kun käyttäjä käyttää /start komentoa
});

// /stop
bot.on('/stop', (msg) => {
    var iid = msg.chat.id

    var array = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    //var datajson = fs.readFileSync('data.json', 'utf8');
    var iideet = jp.query(array, '$..id')
    for (i = 0; i < iideet.length; i += 1) {
        if (iideet[i] == iid) {

            dbjson.get('users')
                .splice(i, 1)
                .write()

            console.log(iid + " Unsubbed")
            return bot.sendMessage(msg.chat.id, `Se on sitten moro ${msg.from.first_name}!`).catch(err => console.log(err));
        } else {
            //älä tee mitää
        }
    }
})

//Tulostaa koko viikon ruokalistan
bot.on('/viikko', (msg) => {
    console.log("[info] Lähetetään viikon ruokalista!")
    lahetaviikonruokalista(msg.chat.id)
})

// Lähettää ruokalistan klo 04:00
var j = schedule.scheduleJob('0 4 * * 1-5', function () {
    console.log("[info] Lähetetään ruokalista!")
    lahetaruokalista()
});

// Admin resend
bot.on('/rs', (msg) => {
    if (msg.chat.id == 81023943) {
        lahetaruokalista()
    } else {
        //Do nothing
    }
})

// Funktionit

//Lähetä
function lahetaruokalista() {

    (async () => {

        let feed = await parser.parseURL(rssurl);
        feed.items.forEach(item => {
            var rssdescription = item.description

            var brr = /<br>/gi
            var rssdescription = rssdescription.replace(brr, '')

            //Hakee data.jsonin
            var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
            //Ettii data.jsonista kaikki ID:t
            var iideet = jp.query(obj, '$..id')

            for (i = 0; i < iideet.length; i += 1) {
                var iidee = iideet[i]
                bot.sendMessage(iidee, item.title + '\nTänään ruokana:\n\n' + rssdescription)
                    .then((response) => {
                        //Do nothing
                    }).catch((error) => {
                        console.log('Error:', error);
                    });
            }
        });

    })()
}

function lahetaviikonruokalista(chatID) {

    (async () => {

        let feed = await parser.parseURL(rssurlviikko);
        feed.items.forEach(item => {
            var rssdescription = item.description
            var rsstitle = item.title

            console.log(rsstitle)

            var brr = /<br>/gi
            var rssdescription = rssdescription.replace(brr, '')


            // for (i = 0; i < rsstitle.length; i += 1) {
            //     console.log("Foo")
            //}

            bot.sendMessage(chatID, item.title + '\nTänään ruokana:\n\n' + rssdescription)
                .then((response) => {
                    //Do nothing
                }).catch((error) => {
                    console.log('Error:', error);
                });
        }
        );

    })
}

//Ohjelman pyöritys
bot.start();