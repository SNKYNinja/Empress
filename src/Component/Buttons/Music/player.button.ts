import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Player } from 'poru';

import { ComponentEditor } from '../../../Structures/Classes/componentEditor.js';
import { icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    id: 'p/p',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player: Player | any = client.poru.players.get(interaction.guild!.id)!;

        const Embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue');

        let emoji: string;
        let style: ButtonStyle;

        if (player.isPaused) {
            Embed.setDescription(`*Track resumed ― </pause:1032316124655792182> to pause it!*`);
            emoji = icon.music.pause;
            style = ButtonStyle.Secondary;
        } else {
            Embed.setDescription(`*Track paused ― </resume:1032316124655792186> to continue*`);
            emoji = icon.music.play;
            style = ButtonStyle.Primary;
        }

        const editor = new ComponentEditor(player.message);
        const rows = await editor.setButtonData(0, 2, { emoji, style, disabled: false });

        player.pause(!player.isPaused);

        interaction.deferUpdate();

        await player.message?.edit({ components: rows });

        interaction.channel
            ?.send({ embeds: [Embed] })
            .then((m: any) => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};

export default button;
