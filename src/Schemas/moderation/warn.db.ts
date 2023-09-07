import { Schema, model } from 'mongoose';

const warnSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true },
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    reason: { type: String, required: true },
    moderator: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() }
});

export default model('Warn', warnSchema);
