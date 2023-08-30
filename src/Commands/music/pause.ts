import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { ComponentEditor } from '../../Structures/Classes/componentEditor.js';

import { icon } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current playing track')
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player: any = client.poru.players.get(interaction.guild!.id)!;

        if (player.isPaused)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***The track is already paused!***`)
                ],
                ephemeral: true
            });

        player.pause(true);

        const editor = new ComponentEditor(player.message);

        const rows = await editor.setButtonData(0, 2, {
            disabled: false,
            emoji: icon.music.play,
            style: ButtonStyle.Primary
        });

        player.message?.edit({ components: rows });

        interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`*Track paused ― </resume:1032316124655792186> to continue*`)
                ]
            })
            .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};

export default command;
