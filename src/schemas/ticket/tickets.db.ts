import { Schema, model } from 'mongoose';

interface IGuildTickets {
    ticketId: number;
    guildId: string;
    ownerId: string;
    membersId: string[];
    channelId: string;
    locked: boolean;
    claimed: boolean;
    claimedBy: string;
    closed: boolean;
    createdAt: number;
}

const arrLimit = (arr: Array<string>) => {
    return arr.length <= 4;
};

const guildTicketsSchema = new Schema<IGuildTickets>({
    ticketId: { type: Number, required: true },
    guildId: { type: String, required: true },
    ownerId: { type: String, required: true },
    membersId: { type: [String], validate: [arrLimit, 'Cannot add more than 4 members(including owner)'] },
    channelId: { type: String, required: true },
    locked: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedBy: { type: String },
    closed: { type: Boolean, default: false },
    createdAt: { type: Number, required: true }
});

const GuildTicket = model('GuildTicket', guildTicketsSchema);

export default GuildTicket;
