import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    GuildTextBasedChannel
} from 'discord.js';
import { SubCommand } from 'typings';
import DB from '../../schemas/ticket.setup.db.js';

const command: SubCommand = {
    subCommand: 'ticket.setup',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const guild = interaction.guild as Guild;

        const channel = interaction.options.getChannel('channel') as GuildTextBasedChannel;
        const transcript = interaction.options.getChannel('transcript');
        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('role');
        const message = interaction.options.getString('message') || ' ';

        const Data = await DB.findOne({ guildId: guild.id });

        if (Data) {
            const ticketChannel = guild.channels.cache.get(Data.channel) as GuildTextBasedChannel;
            const ticketMessage = await ticketChannel?.messages.fetch(Data.ticket);
            ticketMessage.delete();
        }

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

        const replyMessage = await interaction.reply({
            embeds: [ticketEmbed],
            components: [buttonComponents],
            fetchReply: true
        });

        DB.findOneAndUpdate(
            { guildId: guild.id },
            {
                channel: channel?.id,
                transcript: transcript?.id,
                category: category?.id,
                $push: { roles: role?.id },
                message: message,
                ticket: replyMessage.id
            },
            { new: true, upsert: true }
        );
    }
};

export default command;
