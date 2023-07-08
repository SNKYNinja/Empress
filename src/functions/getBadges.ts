export default function addBadges(badgeNames: any, user: any) {
    if (user.bot) return ['<:slashcommand:1091301199153733712>'];
    if (!badgeNames.length) return ['<:red_cross:1048305078651605072>'];
    const badgeMap = {
        ActiveDeveloper: '<:activedeveloper:1091276423400009728>',
        BugHunterLevel1: '<:bughunter_1:1091276434317791272>',
        BugHunterLevel2: '<:bughunter_2:1091276438247833690>',
        PremiumEarlySupporter: '<:earlysupporter:1091276442383417384>',
        Partner: '<:discordpartner:1091276452395233301>',
        Staff: '<:discordstaff:1091276456425951302>',
        HypeSquadOnlineHouse1: '<:hypesquadbravery:1091276462742573106>',
        HypeSquadOnlineHouse2: '<:hypesquadbrilliance:1091276466697814047>',
        HypeSquadOnlineHouse3: '<:hypesquadbalance:1091276460439912509>',
        Hypesquad: '<:hypesquadevents:1091276477145808906>',
        CertifiedModerator: '<:discordmod:1091276446351241318>',
        VerifiedDeveloper: '<:discordbotdev:1091276429771165746>'
    };
    return badgeNames.map((badgeName: any) => badgeMap[badgeName] || '❔');
}
