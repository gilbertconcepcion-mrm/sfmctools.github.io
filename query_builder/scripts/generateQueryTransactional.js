// Function to generate a sendlist query based on the new structure
function generateQueryTransactional(config, tierName) {
    // Part 1 - Fields
    const queryFields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
    
    // Part 1 - Source
    const querySource1 = `FROM [AMC_Subscribers] AS s WITH (NOLOCK)`;
    
    // Part 1 - Sendlist JOIN
    let querySendlistJoin = ``;
    if (config.query.sendlist && config.query.sendlist.trim() !== "") {
        querySendlistJoin = `INNER JOIN [${config.query.sendlist}] al ON al.[EmailAddress] = s.[EmailAddress]`;
    }
    // Part 1 - WHERE clause
    const queryWhere = `WHERE 1=1`;
    
    // Part 1 - Member Status
    const queryMemberStatus = `AND s.MemberStatus = '${config.member.membership}'`;
    
    let queryOptin = ``;
    // Part 1 - Opt-in
    if(config.optin && config.optin !=="NA"){
        queryOptin = config.optIn ? `AND s.[${config.optIn}] = 'Y'` : ``;
    }
    
    // Part 1 - Tier
    const queryTier = tierName ? `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier = '${tierName}' AND ActiveStatus='True')` : ``;
    
    // Part 1 - Age Filter
    let queryAge = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        const age = parseInt(config.member.age);
        if (age === 13) {
            queryAge = `AND (s.Age13to18Indicator = 'Y' OR s.Age18to21Indicator = 'Y' OR s.Age21PlusIndicator = 'Y')`;
        } else if (age === 18) {
            queryAge = `AND (s.Age18to21Indicator = 'Y' OR s.Age21PlusIndicator = 'Y')`;
        } else if (age === 21) {
            queryAge = `AND s.Age21PlusIndicator = 'Y'`;
        }
    }
    
    // Part 1 - Active Status
    const queryActiveStatus = config.member.activeStatus === "Active" ? `AND EXISTS(SELECT 1 FROM [All_Subscribers_Status_Staging] AS sub WITH (NOLOCK) WHERE s.EmailAddress = sub.SubscriberKey AND sub.Status = 'Active')` : ``;
    
    // Part 1 - Complaints
    const queryComplaint = config.complaintsRemoval === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [_Complaint] AS com WITH (NOLOCK) WHERE s.EmailAddress = com.SubscriberKey)` : ``;
    
    // Part 2 - Fields (same as Part 1)
    const part2Fields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
    
    // Part 2 - AMC Master Suppression
    const queryAMCMasterSup = config.amcMasterSupression === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] AS cpesl WITH (NOLOCK) WHERE s.EmailAddress = cpesl.EmailAddress)` : ``;
    
    // Part 2 - Associate Suppression
    const queryAssociateSup = config.associateSupression === "Y" ? `AND COALESCE(s.AMCStubsCardNumber,0) NOT LIKE '1104%' AND COALESCE(s.AMCStubsCardNumber,0) NOT LIKE '11094%'` : ``;
    
    // Part 2 - FreshAddress
    const queryFreshAddress = config.freshAddressExclude === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [FreshAddress_Exclusions_MRM] AS f WITH (NOLOCK) WHERE s.EmailAddress = f.EmailAddress)` : ``;
    
    // Part 3 - Fields (same as Part 1 & 2)
    const part3Fields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
    
    // Part 3 - Engagement
    const queryEngagement = config.engagement === "Y" ? `AND (EXISTS(SELECT 1 FROM [CLICK_ENGAGEMENT_LAST_6_MONTHS] AS c WITH (NOLOCK) WHERE s.EmailAddress = c.SubscriberKey) OR EXISTS(SELECT 1 FROM [LastOpen_6Months] AS o WITH (NOLOCK) WHERE s.EmailAddress = o.EmailAddress))` : ``;

    // Helper function to get current date in YYMMDD format
    function getCurrentDateYYMMDD() {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return yy + mm + dd;
    }

    function replaceTierInDevData(devDataSource, currentTierCode) {
        if (!devDataSource) return '';
        if (!currentTierCode) return devDataSource;

        const upperTier = String(currentTierCode).toUpperCase();
        const re = /(^|[^A-Za-z0-9])(?:MAC|MEA|MEI|MEP|MPG)(?=[^A-Za-z0-9]|$)/gi;
        return devDataSource.replace(re, (match, p1) => {
            return (p1 || '') + upperTier;
        });
    }

    // Get the current tier code (MAC, MEA, MEI, MEP, or MPG)
    let currentTierCode = '';
    for (let key in config.tier) {
        if (config.tier[key].key1 === tierName) {
            currentTierCode = config.tier[key].key2;
            break;
        }
    }

    if (config.query.split === "1") {
        // Single query - all conditions together
        const fullQuery = [
            queryFields,
            querySource1,
            querySendlistJoin,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryAge,
            queryActiveStatus,
            queryComplaint,
            queryAMCMasterSup,
            queryAssociateSup,
            queryFreshAddress,
            queryEngagement
        ].filter(q => q !== '').join('\n');
        
        return { full: fullQuery };
    } else if (config.query.split === "2") {
        // Part 1: Initial selection with core filters
        const part1 = [
            queryFields,
            querySource1,
            querySendlistJoin,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryAge,
            queryActiveStatus,
            queryComplaint
        ].filter(q => q !== '').join('\n');
        
        // Part 2: Query from Part 1 temp table with remaining filters
        let part2SourceTable = '';
        if (config.query.dev1) {
            part2SourceTable = replaceTierInDevData(config.query.dev1, currentTierCode);
        } else {
            const dateStr = getCurrentDateYYMMDD();
            part2SourceTable = `DEV_${dateStr}_${currentTierCode}_PLACEHOLDER`;
        }
        
        const part2Source = `FROM [${part2SourceTable}] AS s WITH (NOLOCK)`;
        
        const part2 = [
            part2Fields,
            part2Source,
            queryWhere,
            queryAMCMasterSup,
            queryAssociateSup,
            queryFreshAddress,
            queryEngagement
        ].filter(q => q !== '').join('\n');
        
        return { part1, part2 };
    } else if (config.query.split === "3") {
        // Part 1: Initial selection with core filters
        const part1 = [
            queryFields,
            querySource1,
            querySendlistJoin,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryAge,
            queryActiveStatus,
            queryComplaint
        ].filter(q => q !== '').join('\n');
        
        // Part 2: Query from Part 1 temp table with suppression filters
        let part2SourceTable = '';
        if (config.query.dev1) {
            part2SourceTable = replaceTierInDevData(config.query.dev1, currentTierCode);
        } else {
            const dateStr = getCurrentDateYYMMDD();
            part2SourceTable = `DEV_${dateStr}_${currentTierCode}_PLACEHOLDER_1`;
        }
        const part2Source = `FROM [${part2SourceTable}] AS s WITH (NOLOCK)`;
        
        const part2 = [
            part2Fields,
            part2Source,
            queryWhere,
            queryAMCMasterSup,
            queryAssociateSup,
            queryFreshAddress
        ].filter(q => q !== '').join('\n');
        
        // Part 3: Query from Part 2 temp table with engagement filters
        let part3SourceTable = '';
        if (config.query.dev2) {
            part3SourceTable = replaceTierInDevData(config.query.dev2, currentTierCode);
        } else {
            const dateStr = getCurrentDateYYMMDD();
            part3SourceTable = `DEV_${dateStr}_${currentTierCode}_PLACEHOLDER_2`;
        }
        const part3Source = `FROM [${part3SourceTable}] AS s WITH (NOLOCK)`;
        
        const part3 = [
            part3Fields,
            part3Source,
            queryWhere,
            queryEngagement
        ].filter(q => q !== '').join('\n');
        
        return { part1, part2, part3 };
    }
}