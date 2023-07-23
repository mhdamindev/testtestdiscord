const fs = require('fs');
const discord = require('discord.js');
const embeds = require('./embeds.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new discord.Client({
  intents: [
    discord.Intents.FLAGS.GUILDS,
    discord.Intents.FLAGS.GUILD_MEMBERS,
    discord.Intents.FLAGS.GUILD_MESSAGES,
    discord.Intents.FLAGS.DIRECT_MESSAGES,
    discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
  ],
  partials: ['CHANNEL', 'MESSAGE', 'REACTION']
});

const commands = [];
const commandNames = [];
const buttons = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

commandFiles.forEach(file => {
  const command = require(`./commands/${file}`);
  if (command.id) {
    commands.push(command.toJSON());
    commandNames[command.name] = command;
  }
});

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

buttonFiles.forEach(file => {
  const button = require(`./buttons/${file}`);
  if (button.id) {
    buttons[button.id] = button;
  }
});

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log('Bot Is Ready');
  let Tickets = require("./db/tickets.json").filter(x=>x.closed==0);

  client.user.setActivity(`${Tickets.length} Tickets`);
  setInterval(() => {
    let Tickets = require("./db/tickets.json").filter(x=>x.closed==0);

    client.user.setActivity(`${Tickets.length} Tickets`);
  }, 30000);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = commandNames[interaction.commandName];
    if (command) {
      command.run(interaction, client);
    }
  } else if (interaction.isButton()) {
    const button = buttons[interaction.customId];
    if (button) {
      button.run(interaction, client);
    }
  }
});

client.login(process.env.TOKEN);

client.on("message",function(message){
    if (message.member.roles.cache.has('1070285268088799232')){
        
    }else {
        if (message.content.includes("https://")||message.content.includes("http://")){
            return message.delete()
        }
    }
})