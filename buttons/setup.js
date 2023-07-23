const { Modal, TextInputComponent, MessageActionRow, MessageSelectMenu, DiscordAPIError, MessageEmbed, MessageButton } = require('discord.js');
const  embeds = require("../embeds.json")
const Save = require("../functions/save")
const projects = require('../db/projects.json')
const pid =  require('../db/pid.json');
const save = require('../functions/save');
const { addUser,getUsers,removeUser,checkUser } = require("../functions/filters")
module.exports = {
    id : "request" , 
    run : async(interaction,client) => {
        if (checkUser(interaction.user.id, "setup")){
            return 
        }
        await  interaction.reply({ephemeral : true , content : "در حال بار گذاری اطلاعات" , fetchReply: true })
        const modal = new Modal()
			.setCustomId('requestProjection')
			.setTitle('درخواست پروژه جدید');
            const titleInput = new TextInputComponent()
			.setCustomId('title')
			.setLabel("موضوع پروژه")
            .setPlaceholder("موضوع پروژه")
            .setRequired(true)
            .setMinLength(3)
			.setStyle('SHORT');
            const desInput = new TextInputComponent()
			.setCustomId('des')
			.setLabel("توضیحات پروژه")
            .setRequired(true)
            .setMinLength(3)

            .setPlaceholder("توضیحات پروژه")
			.setStyle('PARAGRAPH');
            const Selection = new MessageSelectMenu()
            .addOptions({
                label : "Web Developer",
                value  : "Web Developer"
            },{
                label : "Discord Developer",
                value  : "Discord Developer"
            },{
                label : "Geraphic Developer",
                value  : "Geraphic Developer"
            },{
                label : "Video Editor",
                value  : "Video Editor"
            })
            .setCustomId("tag").setMinValues(1).setMaxValues(1).setPlaceholder("انتخاب تگ")
            const SelectionActionRiw = new MessageActionRow().addComponents(Selection);
            const message = await interaction.editReply({content : null, components: [SelectionActionRiw], fetchReply: true})
            addUser(interaction.user.id,"setup")
            const titleActionRiw = new MessageActionRow().addComponents(titleInput);
            const desActionRiw = new MessageActionRow().addComponents(desInput);
            const fields = {
                title : titleInput,
                des : desInput
            }
            modal.addComponents(titleActionRiw, desActionRiw);
            const collector = message.createMessageComponentCollector({
                filter: (u) => {
                    if (u.user.id === interaction.user.id) return true
                    else{
                        return false
                    }
                }            
            })
            collector.on('end', async (cld) => {
                removeUser(interaction.user.id,"setup")
            })
            let sendMsg = false
            collector.on('collect', async (cld) => {
            removeUser(interaction.user.id,"setup")

                    await interaction.editReply({content:"** **", components: [], fetchReply: true})
                   let modalMessage =  await cld.showModal(modal);
        
                   const collector_Modal = await cld.awaitModalSubmit({
                    filter: (u) => {
                        if (u.user.id === cld.user.id) return true
                        else{
                            return false
                        }
                    },
                    time: 60000*10,            
                }).catch(error => {
                    interaction.editReply({content : "زمان شما به پایان رسید"})
                    console.error(error)
                    return null
                  })
                if (collector_Modal){
                    pid.id ++ 
                    let NewID = pid.id 
                    const [ title, des ] = Object.keys(fields).map(key => collector_Modal.fields.getTextInputValue(fields[key].customId))
                   try {
                await    collector_Modal.reply({content : "در حال ارسال درخواست شما",ephemeral:true}).catch(console.log)
                   }catch{}
                    let date = new Date()
                    date=date.getFullYear() + "/" + date.getMonth() + "/" + date.getDay() 
                    projects.push({
                        id : NewID,
                        user : interaction.user.id , 
                        title,
                        des,
                        tag : cld.values[0],
                        date :  date
                    })
                    let Pr = projects.findIndex(x=>x.id==NewID)
                    save("projects.json" , projects)
                    save("pid.json" , pid)
                    let channel = cld.guild.channels.cache.get(process.env.ADMIN_CHANNEL)
                    if (channel) {

                        let embed1 = new MessageEmbed(embeds.admins)
                        embed1.description = embed1.description.replace("$username" , interaction.user.username)
                        embed1.description = embed1.description.replace("$date" , date)
                        let embed2 = new MessageEmbed(embeds.admins2)
                        embed2.description = embed2.description.replace("$Title" , title)
                        embed2.description = embed2.description.replace("$Des" , des)
                        let btn = new MessageActionRow()
                        .addComponents(new MessageButton().setCustomId("p:accept").setLabel("accept").setStyle("SUCCESS"))
                        .addComponents(new MessageButton().setCustomId("p:reject").setLabel("reject").setStyle("DANGER"))
                        if (!sendMsg){
                            let msg = await channel.send({embeds:[embed1,embed2],content : "New Project | پروژه جدید" , components:[btn]})
                            projects[Pr].msg = msg.id
                            sendMsg = true
                        }
                        save("projects.json" , projects)
                        save("pid.json" , pid)
                        try {
                        collector_Modal.editReply({content : "در خواست شما ارسال شد"}).catch(console.log)
                        }catch{}
                    }
                }
               
         
            })

    }
}