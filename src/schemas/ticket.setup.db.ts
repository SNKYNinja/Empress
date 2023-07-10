import { Schema, model } from 'mongoose';

interface ITicketSetup {
    guildId: string;
    channel: string;
    category: string;
    transcript: string;
    roles: string[];
    message: string;
    ticket: string;
}

const ticketSetupSchema = new Schema<ITicketSetup>({
    guildId: String,
    channel: String,
    category: String,
    transcript: String,
    roles: [String],
    message: String,
    ticket: String
});

export default model('ticketSetup', ticketSetupSchema, 'ticketSetup');
