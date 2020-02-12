const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();
require('dotenv').config();
const { TOKEN, TRNKEY } = process.env;

const trnEP = "https://public-api.tracker.gg/v2/apex/standard/profile";

const names = ['DarkBicreeper', 'theStav19', 'Dur3nda1']

let general, testing, gameRecords;

client.once('ready', () => {
    console.log('Ready!');
    general = client.channels.get('668906184727592997');
    testing = client.channels.get('676881914988068864');
    gameRecords = client.channels.get('676941675125276703');
});

client.on('message', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).split(' ');
    if (args[0] === 'stats')
        message.reply(await getTRNStats('origin', args[1]));
    else if (args[0] === 'ping') {
        const user = message.mentions.users.first();
        message.reply(`you really want to talk to ${user}`);
    } else
        message.reply("bud, that isn't a recognized command...");
});

const getTRNRecent = async (plat, id) => {
    const res = await fetch(`${trnEP}/${plat}/${id}/sessions`, {
        method: 'GET',
        headers: { 'TRN-Api-Key': TRNKEY }
    });
    const json = await res.json();
    const { metadata: { endDate, character, characterIconUrl }, stats: { level, kills, rankScore } } = json.data.items[0].matches[0]

    const exampleEmbed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle(id)
        .setAuthor(character.displayValue)
        .setThumbnail(characterIconUrl.value)
        .setDescription('Recent Game')
        .addField('Level', level.displayValue, true)
        .addField('Kills', kills.displayValue, true)
        .addField('New Rank Score', rankScore.displayValue, true)
        .setTimestamp(new Date(endDate.value))

    gameRecords.send(exampleEmbed);
}

const getTRNStats = async (plat, id) => {
    const res = await fetch(`${trnEP}/${plat}/${id}`, {
        method: 'GET',
        headers: { 'TRN-Api-Key': TRNKEY }
    });
    const json = await res.json();

    const { level, kills } = json.data.segments[0].stats;
    const { name, imageUrl, bgImageUrl } = json.data.segments[1].metadata;

    const exampleEmbed = new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle(id)
        .setAuthor(name)
        .setDescription('Service Record')
        .setThumbnail(imageUrl)
        .addField('Level', level.displayValue)
        .addField('Kills', kills.displayValue)
        .setImage(bgImageUrl)
        .setTimestamp()

    return exampleEmbed;
}

client.login(TOKEN);

module.exports = {
    stat: getTRNStats,
    rec: () => {
        gameRecords.send(`This is the current record for ${new Date().toLocaleString()}`)
        for (let name of names)
            getTRNRecent('origin', name)
    }
}