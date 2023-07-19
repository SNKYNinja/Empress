import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    TextChannel
} from 'discord.js';
import { SubCommand } from 'typings';
import DB from '../../schemas/ticket/setup.db.js';

const command: SubCommand = {
    subCommand: 'ticket.setup',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const guild = interaction.guild as Guild;

        const channel = interaction.options.getChannel('channel') as TextChannel;
        const transcript = interaction.options.getChannel('transcript');
        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('role')!;
        const message = interaction.options.getString('message') || ' ';

        const Data = await DB.findOne({ guildId: guild.id });

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
                $set: { roles: [role.id] },
                description: message,
                messageId: replyMessage.id
            },
            { new: true, upsert: true }
        )
            // .then((data) => console.log(data))
            .catch((err) => console.log(err));
    }
};

export default command;
