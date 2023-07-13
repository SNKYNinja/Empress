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
    close: boolean;
}

const guildTicketsSchema = new Schema<IGuildTickets>({
    ticketId: Number,
    guildId: String,
    ownerId: String,
    membersId: [String],
    channelId: String,
    locked: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedBy: String,
    close: { type: Boolean, default: false }
});

export default model('guildTickets', guildTicketsSchema, 'guildTickets');
