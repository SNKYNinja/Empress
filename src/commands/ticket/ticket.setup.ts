import { DiscordClient } from 'bot.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    TextChannel
} from 'discord.js';
import { SubCommand } from 'Typings';
import DB from '../../Schemas/ticket/setup.db.js';
import { createTicketPanel } from '../../Functions/createTicketPanel.js';

const command: SubCommand = {
    subCommand: 'ticket.setup',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const guild = interaction.guild as Guild;

        const channel = interaction.options.getChannel('channel') as TextChannel;
        const transcript = interaction.options.getChannel('transcript');
        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('role')!;
        const message = interaction.options.getString('message') || ' ';

        const { ticketEmbed, buttonComponents } = createTicketPanel(client, guild, message);

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
                messageId: replyMessage.id,
                description: message
            },
            { new: true, upsert: true }
        )
            // .then((data) => console.log(data))
            .catch((err) => console.log(err));
    }
};

export default command;
