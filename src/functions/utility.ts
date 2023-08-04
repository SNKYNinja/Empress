import { Channel, ChannelType, GuildChannelManager, Role } from 'discord.js';

const splitPascal = (string: string, separator: string) => string.split(/(?=[A-Z])/).join(separator);

const toPascalCase = (string: string, separator: string | false = false) => {
    const pascal =
        string.charAt(0).toUpperCase() +
        string
            .slice(1)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
    return separator ? splitPascal(pascal, separator) : pascal;
};

const getChannelTypeSize = (channels: GuildChannelManager, type: Array<ChannelType>) =>
    channels.cache.filter((channel) => type.includes(channel.type)).size;

const maxDisplayRoles = (roles: Role[], maxFieldLength = 1024) => {
    let totalLength = 0;
    const result: Array<string> = [];

    for (const role of roles) {
        const roleString = `<@&${role.id}>`;

        if (roleString.length + totalLength > maxFieldLength) break;

        totalLength += roleString.length + 1; // +1 as it's likely we want to display them with a space between each role, which counts towards the limit.
        result.push(roleString);
    }

    return result.length;
};

export { splitPascal, toPascalCase, getChannelTypeSize, maxDisplayRoles };
