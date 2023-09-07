import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { icon } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    player: true,
    sameVc: true,
    inVc: true,
    data: new SlashCommandBuilder().setName('clear-queue').setDescription('Remove all the tracks from the queue'),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (player.queue.length === 0)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***There are no tracks in the queue to clear!***`)
                ],
                ephemeral: true
            });

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(
                `*Cleared **${player.queue.length} track${player.queue.length > 1 ? 's' : ''}** from queue*`
            );

        player.queue.clear();

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
