import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Player } from 'poru';

import { trimSentence } from '../../../Functions/trimSentence.js';
import { ComponentEditor } from '../../../Structures/Classes/componentEditor.js';

const button: ButtonInterface = {
    inVc: true,
    sameVc: true,
    currentTrack: true,
    id: 'loop',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player: Player | any = client.poru.players.get(interaction.guild!.id);

        const data = switchLoop(player);

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(data.description);

        const editor = new ComponentEditor(player.message);

        const rows = await editor.setButtonData(0, 0, {
            emoji: data.emoji,
            disabled: false
        });

        await player.message?.edit({ components: rows });
        interaction.channel
            ?.send({
                embeds: [Embed]
            })
            .then((m: any) => setTimeout(() => m?.delete(), 7 * 1000));

        interaction.deferUpdate();
    }
};

export default button;

function switchLoop(player: Player) {
    let description: string;
    let emoji: string;

    const queueLoop = `*Queue Looped ― **${player.queue.length + 1}** track${player.queue.length === 1 ? '' : 's'}*`;
    const trackLoop = `*Track Looped ― [${trimSentence(player.currentTrack.info.title, 31)}](${
        player.currentTrack.info.uri
    })*`;
    const disabledLoop = '*Loop Disabled ― Player*';

    if (player?.loop === 'TRACK') {
        if (player.queue.length > 0) {
            player.setLoop('QUEUE');
            description = queueLoop;
            emoji = '<:loop_queue:1072180901364113539>';
        } else {
            player.setLoop('NONE');
            description = disabledLoop;
            emoji = '<:loop_button:1039487431709311026>';
        }
    } else if (player?.loop === 'QUEUE') {
        player.setLoop('NONE');
        description = disabledLoop;
        emoji = '<:loop_button:1039487431709311026>';
    } else {
        player?.setLoop('TRACK');
        description = trackLoop;
        emoji = '<:loop_once:1072180421598650448>';
    }

    return { description, emoji };
}
