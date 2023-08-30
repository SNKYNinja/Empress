import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    id: 'shuffle',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id!)!;

        if (player.queue.length <= 1)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***No tracks in the queue to shuffle***`)
                ],
                ephemeral: true
            });

        player.queue.shuffle();

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(
                `*Shuffled ― **${player.queue.length}** track${player.queue.length === 1 ? '' : 's'} of the queue*`
            );

        await interaction.deferUpdate();

        interaction.channel?.send({ embeds: [Embed] });
    }
};

export default button;
