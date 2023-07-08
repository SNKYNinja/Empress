// declare in global space
declare global {
    // JS objects in the global namespace
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DATABASE_URL: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export {};
