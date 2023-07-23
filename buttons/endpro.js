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
    id : "ticket:end" , 
    run : async(interaction,client) => {

        let ticket = tickets.find(x=>x.channel===interaction.channel.id)
        let ticketID = tickets.findIndex(x=>x.channel===interaction.channel.id)
        if (!ticket){
            interaction.reply({content:"این پروژه پیدا نشد",ephemeral :true})
            interaction.channel.delete()
            return
        }
        let pr = projects.find(x=>x.id === ticket.id)
        if (pr.user!==interaction.user.id){return}
        if (!pr){
            // interaction.reply({content:"این پروژه پیدا نشد",ephemeral :true})
            // interaction.channel.delete()
            // return
        }
        if (ticket.closed)return;

        await interaction.reply({content : `در حال بار گذاری اطلاعات`,ephemeral:true })
        let channel = interaction.guild.channels.cache.get(process.env.CHANNEL_PROJECTS)
        if (channel) { 
            // channel.messages.fetch().then(m=>{
            //     m.find(x=>x.id == pr.msg) &&  m.find(x=>x.id == pr.msg).delete()
            // })
        }
        await interaction.editReply({content : `پروژه به اتمام رسید`,ephemeral:true })
        let button = new discord.MessageButton()
        .setCustomId("ticket:close")
        .setStyle("SECONDARY")
        .setLabel("Close")
    
        let button2 = new discord.MessageButton()
        .setCustomId("ticket:end")
        .setStyle("PRIMARY")
        .setLabel("End Project")
        .setDisabled(true)
        let row = new discord.MessageActionRow().addComponents(button,button2)
        interaction.message.edit({components:[row]})
    }
}