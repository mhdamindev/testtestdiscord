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
    id : "pr:req" , 
    run : async(interaction,client) => {
        let pr = projects.find(x=>x.msg === interaction.message.id)
        if (!pr){
            interaction.reply({content:"این پروژه پیدا نشد",ephemeral :true})
            interaction.message.delete()
            return
        }
        if (!interaction.member.roles.cache.has(require("../tags.json")[pr.tag])){return }
        await interaction.reply({ephemeral:true , content : `در حال بار گذاری اطلاعات`})
        if (tickets.find(x=>x.developer == interaction.user.id&&x.id==pr.id&&x.closed)){
            return interaction.editReply({content : "شما یک تیکت باز با این پروژه دارید : "+`<#${tickets.find(x=>x.developer == interaction.user.id&&x.id==pr.id).channel}>`})
        }
        await interaction.editReply({content : "در حال ساخت تیکت ..."})
        let Category = interaction.guild.channels.cache.filter(x=>x.parent===Config.ticket)
        if (Category.size>48){
            let newCategory = await interaction.guild.channels.create("TICKETS" , {type :"GUILD_CATEGORY"})
            Config.ticket = newCategory.id
            fs.writeFileSync("./cfg.json",JSON.stringify(Config))
        }
        let id = await formatid(pr.id) || "N/A"
        await interaction.guild.members.fetch()
        interaction.guild.channels.create(`ticket-${id}` , {
            parent : Config.ticket,
            permissionOverwrites : [
                {
                    id : interaction.guild.id,
                    allow : ['SEND_MESSAGES', 'ATTACH_FILES' , 'EMBED_LINKS'],
                    deny : ['VIEW_CHANNEL']
                },
                {
                    id : pr.admin || "942008099638743040",
                    allow : ['MANAGE_MESSAGES' ,"SEND_MESSAGES" , "VIEW_CHANNEL"]
                },
                {
                    id : interaction.user.id ,
                    allow : 'VIEW_CHANNEL'
                },
                {
                    id : pr.user || "942008099638743040",
                    allow : 'VIEW_CHANNEL'
                }
            ]
        }).catch(err=>{
                console.error(err)
        }).then(async channel =>{
            if (!channel){return}
            // await interaction.channel.permissionOverwrites.edit(pr.user,{"VIEW_CHANNEL":true})
            // await interaction.channel.permissionOverwrites.edit(interaction,{"VIEW_CHANNEL":true})
            let button = new discord.MessageButton()
            .setCustomId("ticket:close")
            .setStyle("SECONDARY")
            .setLabel("Close")
            let button2 = new discord.MessageButton()
            .setCustomId("ticket:end")
            .setStyle("PRIMARY")
            .setLabel("End Project")
            let row = new discord.MessageActionRow().addComponents(button,button2)
            let embed2 = new discord.MessageEmbed()
            .setDescription(`Support will be with you shortly.
            To close this ticket react with 🔒`)
            .setColor("#58b9ff")
           
            let msg = await channel.send({content:`|| <@${pr.admin}> | <@${pr.user}> | <@${interaction.user.id}> ||`,components:[row],embeds:[embed2]})
            tickets.push(
                {
                    id : pr.id,
                    admin : pr.admin,
                    channel : channel.id ,
                    closed : 0 ,
                    developer : interaction.user.id ,
                    msg : msg.id ,
                    user : pr.user
                }
            )
            save("tickets.json",tickets)
            await interaction.editReply({content : `تیکت ساخته شد : <#${channel.id}>`})
            let _channel = interaction.guild.channels.cache.get(process.env.CHANNEL_PROJECTS)
            if (_channel) { 
                _channel.messages.fetch().then(m=>{
                        const button = new MessageActionRow().addComponents(
                        new MessageButton().setStyle("PRIMARY").setLabel("Accepted").setCustomId("pr:req").setDisabled(true)
                    )
                    m.find(x=>x.id == pr.msg) &&  m.find(x=>x.id == pr.msg).edit( { components:[button] } )
                })
            }
        })
    }
}