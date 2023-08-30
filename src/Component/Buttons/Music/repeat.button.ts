import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder, Message } from 'discord.js';
import { icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    player: true,
    sameVc: true,
    inVc: true,
    currentTrack: true,
    id: 'repeat',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (!player.currentTrack.info.isSeekable)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder().setColor('Red').setDescription(`${icon.info.error} ***Track is not seekable!***`)
                ]
            });

        player.seekTo(0);

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Track Repeated ― [${player.currentTrack.info.title}](${player.currentTrack.info.uri})*`);

        interaction.deferUpdate();

        interaction.channel
            ?.send({ embeds: [Embed] })
            .then((message: Message) => setTimeout(() => message.delete(), 7000));
    }
};

export default button;
