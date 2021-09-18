const Discord = require('discord.js');
const client = new Discord.Client;
const {statuschannelid, statusmessageid} = require("./config.json");
const ms = require('ms');
const fs = require('fs');
const config = require("./config.json");
const fivem = require("discord-fivem-api");
const server = new fivem.DiscordFivemApi(config["ip"]);

client.on("ready", async () => {
    console.log("[Logs] Bot Online!")
    client.commands = new Discord.Collection();
    setInterval(async () => {
    await server.getPlayers().then(async (data) => {
    data = data.sort((d, c) => d.id - c.id);
    let playersName = [];
    let playersID = [];
    let playersDiscord = [];
    for (let player of data) {
    playersName.push(player.name);
    playersID.push(player.id);
    const discord = [];
    for (let identifiers of player.identifiers) {
    if (identifiers.startsWith("discord:")) discord.push(identifiers.replace('discord:', ''));
    }
    playersDiscord.push(discord.length > 0 ? `<@${discord}>` : 'None');
    }
    const maxPlayers = await server.getMaxPlayers();
    
    let guild = client.guilds.cache.get(config["guildid"])
    client.user.setActivity(`${guild.memberCount} Members | (${data.length}/${maxPlayers})`);
    let channel = client.channels.cache.get(statuschannelid)
    const space = parseInt((data.length*100)/maxPlayers)
    channel.messages.fetch({around: statusmessageid, limit: 1}).then(messages => {
    const embed = new Discord.MessageEmbed()
    .setThumbnail(guild.iconURL({ dynamic: true}))
    .setColor(config["color"])
    .setAuthor(config["name"] + " | " + "Server Is Online!")
    .setDescription("Players: " + data.length + "/" + maxPlayers + "\n" + "Space: " + space + "%")
    .addFields(
    { name: "ID", value: `${playersID.join('\n') || "None"}`, inline: true},
    { name: "Name", value: `${playersName.join('\n') || "None"}`, inline: true},
    { name: "Discord", value: `${playersDiscord.join('\n') || "None"}`, inline: true},
    )
    .setTimestamp()
    .setFooter("Coded By Dang3r.#3553")
    messages.first().edit(embed).then(console.log("[Logs] Message has been edited!, Message ID" + " " + statusmessageid + " " + "Players Online" +  " " + data.length + "/" + maxPlayers));
    });
    }).catch((err) => {
    let cchannel = client.channels.cache.get(statuschannelid)
    let gguild = client.guilds.cache.get(config["guildid"])
    
    client.user.setActivity(`${gguild.memberCount} Members | (OFF)`);
    
    cchannel.messages.fetch({around: statusmessageid, limit: 1}).then(messages => {
    const embed = new Discord.MessageEmbed()
    .setColor(config["color"])
    .setAuthor(config["name"] + " | " + "Server Is Offline!")
    .setThumbnail(gguild.iconURL({ dynamic: true}))
    .addFields(
        { name: "ID", value: `None`, inline: true},
        { name: "Name", value: `None`, inline: true},
        { name: "Discord", value: `None`, inline: true},
        )
    .setTimestamp()
    .setFooter("Coded By Dang3r.#3553")
    messages.first().edit(embed).then(console.log("Message has been edited!, Message ID" + " "+ statusmessageid + " " +  "Server Offline!"));
    })
    });
    }, 30 * 1000);
    });
    

    client.on("message", async (message) => {
        if(message.content.startsWith(config["prefix"] + "ip")){
                const embed = new Discord.MessageEmbed()
                .setTitle(config["name"] + " | " + "Server IP's")
                .setDescription(`Fivem IP: [Connect Link](${config["connectip"]})` + "\n" + `TeamSpeak IP: [Connect Link](${config["tsip"]})`)
                .setThumbnail(message.guild.iconURL({ dynamic: true}))
                .setColor(config["color"])
                .setFooter("Coded By Dang3r.#3553")
                .setTimestamp()

                message.channel.send(embed)
        }

    })


    client.login(config["token"])
