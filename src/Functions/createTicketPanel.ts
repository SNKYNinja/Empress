import { DiscordClient } from 'bot.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from 'discord.js';

function createTicketPanel(client: DiscordClient, guild: Guild, message: string) {
    const ticketEmbed = new EmbedBuilder()
        .setColor('#2F3136')
        .setAuthor({ name: `${client.user?.username} | Ticket System`, iconURL: guild.iconURL() as string })
        .setImage('https://media.discordapp.net/attachments/984827887020568677/1017708024292454440/TVTIQyp.png')
        .setDescription(message);

    const buttonComponents = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('createTicket')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:icon_bug_hunter:1017706220632670279>')
    );

    return { ticketEmbed, buttonComponents };
}

export { createTicketPanel };
