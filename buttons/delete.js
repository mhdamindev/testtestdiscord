const { Modal, TextInputComponent, MessageActionRow, MessageSelectMenu, DiscordAPIError, MessageEmbed, MessageButton } = require('discord.js');
const discord = require("discord.js")
const  embeds = require("../embeds.json")
const Save = require("../functions/save")
const projects = require('../db/projects.json')
const tickets =  require('../db/tickets.json');
const save = require('../functions/save');
const formatid = require('../functions/formatid');
const Config = require('../cfg.json');
module.exports = {
    id : "ticket:delete" , 
    run : async(interaction,client) => {
       
        tickets.shift(tickets.find(x=>x.channel===interaction.channel))
        projects.shift(tickets.find(x=>x.channel===interaction.channel))
        save("tickets.json" , tickets)
        save("projects.json" , projects)
        interaction.channel.delete()
    }
}