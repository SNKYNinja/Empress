import { DiscordClient } from 'bot';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { Player } from 'poru';

export const playerDestroy = async (player: Player | any, client: DiscordClient) => {
    const channel = client.channels.cache.get(player?.textChannel) as TextChannel;

    await player.message?.delete().catch(() => {});

    const Embed = new EmbedBuilder()
        .setColor('#2f3136')
        .setAuthor({ name: client.user?.displayName!, iconURL: client.user?.displayAvatarURL() })
        .setTitle('`✦` *Player Disconnected*')
        .setDescription(
            `
    *Add more tracks through: </play:1032316124655792183> ― </playlist load:1036662958522122412> ― </liked-songs load:1045306555584745573>*`
        )
        .setTimestamp();

    return await channel.send({
        embeds: [Embed]
    });
};
