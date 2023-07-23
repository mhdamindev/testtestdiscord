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
    id : "ticket:close" , 
    run : async(interaction,client) => {
        let ticket = tickets.find(x=>x.channel===interaction.channel.id)
        let ticketID = tickets.findIndex(x=>x.channel===interaction.channel.id)
        let $$ID = projects.findIndex(x=>x.id===ticket.id)
        if (ticket.closed)return;
        if (!ticket){
            interaction.reply({content:"این پروژه پیدا نشد",ephemeral :true})
            interaction.channel.delete()
            return
        }
        let pr = projects.find(x=>x.id === ticket.id)

        if (!pr){
            interaction.reply({content:"این پروژه پیدا نشد",ephemeral :true})
            interaction.channel.delete()
            return
        }
        await interaction.reply({content : `در حال بار گذاری اطلاعات`})
        let button = new discord.MessageButton()
        .setCustomId("ticket:confirm")
        .setStyle("DANGER")
        .setLabel("Close")
        let button2 = new discord.MessageButton()
        .setCustomId("ticket:cancel")
        .setStyle("SECONDARY")
        .setLabel("Cancel")
        let row = new discord.MessageActionRow().addComponents(button,button2)
        await interaction.editReply({content : "ایا با بستن تیکت موافق هستید", components : [row]})
        const filter = (btnInt) => { return interaction.user.id === btnInt.user.id }
        const aceCollector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 30000});
        aceCollector.on("collect", async (btnInt) => {
            interaction.deleteReply()
            if (btnInt.customId == "ticket:confirm"){
            await interaction.guild.members.fetch()
            let id = formatid(pr.id)
            await interaction.channel.permissionOverwrites.edit(pr.user,{"VIEW_CHANNEL":false})
            await interaction.channel.permissionOverwrites.edit(ticket.developer,{"VIEW_CHANNEL":false})
            interaction.channel.setName(`closed-${id}`)
            tickets[ticketID].closed = 1
            projects[$$ID].close = 1
            save("tickets.json" , tickets)
            save("projects.json" , projects)
            let embed = new discord.MessageEmbed()
            .setDescription("Ticket Closed By "+`<@!${interaction.user.id}>`)
            .setColor('YELLOW')
            let embed2 = new discord.MessageEmbed()
            .setDescription(` تیکت ${id} به صورت موقت بسته شد`)
            .setFooter(ticket.id.toString())
            .setColor("#58b9ff")

            let embedA = new discord.MessageEmbed()
            .setDescription("```Support team ticket controls```")
            .setColor("#030711")
            let button3 = new discord.MessageButton()
            .setCustomId("ticket:delete")
            .setStyle("SECONDARY")
            .setLabel("Delete")
            .setEmoji("🗑️")
            let button4 = new discord.MessageButton()
            .setCustomId("ticket:reqopen")
            .setStyle("PRIMARY")
            .setLabel("Request To Open")
            let row = new discord.MessageActionRow().addComponents(button3)
            let row2 = new discord.MessageActionRow().addComponents(button4)
            interaction.channel.send({embeds:[embed,embedA],components:[row]})
            let user = interaction.guild.members.cache.get(pr.user)
            if (user&&user.createDM(true)){
                    try { 
                        user.send({embeds:[embed2],components : [row2] })
                    }catch{}
            }
        }
        })
        aceCollector.on("end" , async function(){
            
        })
    }
}