import addBadges from '../../Functions/getBadges.js';
import { DiscordClient } from 'bot.js';
import { SubCommand } from 'Typings';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    Role,
    User
} from 'discord.js';
import { icon } from '../../Structures/Design/icons.js';

const command: SubCommand = {
    subCommand: 'info.user',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();
        const user = (await interaction.options.getUser('target')?.fetch()) as User;
        const member = interaction.options.getMember('target') as GuildMember;

        function displayHex(member: GuildMember) {
            if (member.displayHexColor === '#000000') return '#2F3136';
            return member.displayHexColor;
        }

        const hexColor = displayHex(member);
        const roles = member?.roles?.cache
            .sort((a: Role, b: Role) => b.position - a.position)
            .map((role) => role)
            .filter((role) => role.name !== '@everyone');

        let roleString: string;
        if (roles.length >= 1) roleString = roles.join('').replace('@everyone', '');
        else roleString = 'None';

        const joinedServer: number = Math.floor((member.joinedTimestamp as number) / 1000);
        const joinedDiscord = Math.floor(user.createdTimestamp / 1000);

        const booster = member?.premiumSince
            ? '<:discordboost7:1091276425732030566>'
            : '<:red_cross:1048305078651605072>';

        const userBadges = user.flags?.toArray();

        const bannerURL = user.bannerURL({ size: 2048, extension: 'jpeg' });

        const responseEmbed = new EmbedBuilder()
            .setColor(hexColor)
            .setAuthor({
                name: `${user.username} | ${user.id}`,
                iconURL: user?.displayAvatarURL()
            })
            .addFields(
                {
                    name: '`✦` Badges',
                    value: `<:reply:1001495577093230753> ${addBadges(userBadges, user).join('')}`,
                    inline: true
                },
                {
                    name: '`✦` Booster',
                    value: `${icon.reply.default} ${booster}`,
                    inline: true
                },
                {
                    name: `\`✦\` Roles (${roles.length})`,
                    value: `${icon.reply.default} ${roleString}`,
                    inline: false
                },
                {
                    name: '`✦` Joined Server',
                    value: `${icon.reply.default} <t:${joinedServer}:D>`,
                    inline: true
                },
                {
                    name: '`✦` Joined Discord',
                    value: `${icon.reply.default} <t:${joinedDiscord}:D>`,
                    inline: true
                }
            );

        const Row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Avatar').setURL(member.displayAvatarURL())
        );
        if (bannerURL) {
            responseEmbed.setImage(bannerURL as string);
            Row.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Banner')
                    .setURL(bannerURL as string)
            );
        }

        interaction.editReply({
            embeds: [responseEmbed],
            components: [Row]
        });
    }
};
export default command;
