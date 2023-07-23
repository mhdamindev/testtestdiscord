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
    id : "ticket:reqopen:a" , 
    run : async(interaction,client) => {

        let pr = projects.find(x=>x.id === Number( interaction.message.embeds[0].footer.text))
        let $ = tickets.find(x=>x.id === Number( interaction.message.embeds[0].footer.text))
        let $id = tickets.findIndex(x=>x.id === Number( interaction.message.embeds[0].footer.text))
        let $$id = projects.findIndex(x=>x.id === $.id)
        if (!pr||!$){
            interaction.message.delete()
            return
        }
        let id = formatid(pr.id)
     
    
            let embed = new discord.MessageEmbed()  
            .setDescription("Ticket Opned By "+`<@!${interaction.user.id}>`)
            .setColor('BLUE')
            let channel = client.channels.cache.get($.channel)
           if(channel) {channel.send({embeds:[embed]})
        await channel.permissionOverwrites.edit(pr.user,{"VIEW_CHANNEL":true})
        await channel.permissionOverwrites.edit($.developer,{"VIEW_CHANNEL":true})
        channel.setName(`ticket-${id}`)
        channel.send(`<@${$.developer}> <@${pr.user}>`).then(m=>{
            setTimeout(() => {
                    m.delete()
            }, 2000);
        })

    }       
        tickets[$id].closed = 0
        projects[$$id].close = 1
        save("tickets.json" , tickets)
        save("projects.json" , projects)
        interaction.message.delete()

    }
}