import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    inVc: true,
    sameVc: true,
    id: 'prev',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id);

        if (!player?.previousTrack)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***No previous track was found!***`)
                ]
            });

        const Embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue')
            .setTimestamp()
            .setDescription(
                `*Skipped to previous track ― [${player.previousTrack.info.title}](${player.previousTrack.info.uri})*`
            );

        player.queue.unshift(player.previousTrack);
        player.loop === 'QUEUE' && player.queue.pop();

        const message = await interaction.channel!.send({ embeds: [Embed] });
        setTimeout(() => message?.delete(), 7000);
        player.stop();
    }
};

export default button;
