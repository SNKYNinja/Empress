import { Schema, model, Document } from 'mongoose';

interface Playlist extends Document {
    userId: string;
    name: string;
    tracks: { name: string; url: string }[];
    public: boolean;
}

const playlistSchema = new Schema<Playlist>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    tracks: [{ name: String, url: true }],
    public: { type: Boolean, default: false }
});

export default model<Playlist>('Playlist', playlistSchema);
