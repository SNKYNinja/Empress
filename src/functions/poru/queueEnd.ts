import { DiscordClient } from 'bot';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { Player } from 'poru';

export const queueEnd = async (player: Player | any, client: DiscordClient) => {
    player.message?.delete();

    const Embed = new EmbedBuilder()
        .setColor('#2F3136')
        .setAuthor({ name: client.user?.username!, iconURL: client.user?.displayAvatarURL() })
        .setTitle('`✦` *Queue Ended*').setDescription(`
        *Add more tracks through: </play:1032316124655792183> ― </playlist load:1036662958522122412> ― </liked-songs load:1045306555584745573>*
        `);

    const channel = client.channels.cache.get(player.textChannel) as TextChannel;
    channel.send({ embeds: [Embed] });
};
