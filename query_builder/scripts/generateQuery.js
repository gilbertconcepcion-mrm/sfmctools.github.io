// Function to show notification helper
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    
    if (type === 'warning') {
        notification.style.background = '#f39c12'; // Orange
    } else if (type === 'error') {
        notification.style.background = '#e74c3c'; // Red
    } else if (type === 'info') {
        notification.style.background = '#3498db'; // Blue
    } else {
        notification.style.background = '#2ecc71'; // Green
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}
// Function to generate a query based on the new structure
function generateQuery(config, tierName) {
    const queryFields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
    const querySource1 = `FROM [AMC_Subscribers] AS s WITH (NOLOCK)`;
    const queryGenre1 = config.genre && config.genre !== "NONE" ? `INNER JOIN [AMC_Genre_targeting] al ON al.LOYALTYACCOUNTID = s.AMCStubsKobieAccountID` : ``;
    let querySendlist = ``;
    if (config.query.sendlist && config.query.sendlist.trim() !== "") {
        querySendlist = `INNER JOIN [${config.query.sendlist}] al ON al.[EmailAddress] = s.[EmailAddress]`;
    }
    const queryWhere = `WHERE 1=1`;
    const queryMemberStatus = `AND s.MemberStatus = '${config.member.membership}'`;
    let queryOptin = ``;
    if(config.optIn && config.optIn !=="NA"){
        queryOptin = config.optIn ? `AND s.[${config.optIn}] = 'Y'` : ``;
    }
    const queryTier = tierName ? `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier = '${tierName}' AND ActiveStatus='True')` : ``;
    const queryGenre2 = config.genre && config.genre !== "NONE" ? `AND (al.[${config.genre}] = 'True')` : ``;
    let queryDOB = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        queryDOB = `AND (ISNULL(s.[DateOfBirth], '') <> '' AND s.DateOfBirth <= DATEADD(year, -${parseInt(config.member.age)}, GETDATE()))`;
    }
    const queryActiveStatus = config.member.activeStatus === "Active" ? `AND EXISTS (SELECT 1 FROM All_Subscribers_Status_Staging AS sub WITH (NOLOCK) WHERE s.EmailAddress = sub.SubscriberKey AND sub.Status = 'Active')` : ``;
    const queryComplaint = config.complaintsRemoval === "Y" ? `AND NOT EXISTS (SELECT 1 FROM _Complaint AS com WITH (NOLOCK) WHERE s.EmailAddress = com.SubscriberKey)` : ``;
    const queryAMCMasterSup = config.amcMasterSupression === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] AS cpesl WITH (NOLOCK) WHERE s.EmailAddress = cpesl.EmailAddress)` : ``;
    const queryAssociateSup = config.associateSupression === "Y" ? `AND s.amcStubsCardNumber IS NOT NULL AND s.amcStubsCardNumber NOT LIKE '1104%' AND s.amcStubsCardNumber NOT LIKE '11094%'` : ``;
    const queryFreshAddress = config.freshAddressExclude === "Y" ? `AND NOT EXISTS ( SELECT 1 FROM FreshAddress_Exclusions_MRM AS f WITH (NOLOCK) WHERE s.EmailAddress = f.EmailAddress)` : ``;
    const queryEngagement = config.engagement === "Y" ? `AND (EXISTS (SELECT 1 FROM CLICK_ENGAGEMENT_LAST_6_MONTHS AS c WITH (NOLOCK) WHERE s.EmailAddress = c.SubscriberKey) OR EXISTS (SELECT 1 FROM LastOpen_6Months AS o WITH (NOLOCK) WHERE s.EmailAddress = o.EmailAddress))` : ``;

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
        if (!currentTierCode) return devDataSource; // keep original if no replacement provided

        const upperTier = String(currentTierCode).toUpperCase();

        // Match tokens (MAC|MEA|MEI|MEP|MPG) when they are
        // - at start of string or preceded by a non-alphanumeric character
        // AND
        // - at end of string or followed by a non-alphanumeric character
        // We capture the leading char (if any) so we can keep it in the replacement.
        const re = /(^|[^A-Za-z0-9])(?:MAC|MEA|MEI|MEP|MPG)(?=[^A-Za-z0-9]|$)/gi;

        // Replace and keep the prefix group ($1)
        return devDataSource.replace(re, (match, p1) => {
            // p1 is the leading char or '' if start-of-string
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
            queryGenre1,
            querySendlist,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryGenre2,
            queryDOB,
            queryActiveStatus,
            queryComplaint,
            queryAMCMasterSup,
            queryAssociateSup,
            queryFreshAddress,
            queryEngagement
        ].filter(q => q !== '').join('\n');
        
        return { full: fullQuery };
    } else if (config.query.split === "2") {
        // 2-part query
        // Part 1: Initial selection with core filters
        const part1 = [
            queryFields,
            querySource1,
            queryGenre1,
            querySendlist,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryGenre2,
            queryDOB,
            queryActiveStatus,
            queryComplaint
        ].filter(q => q !== '').join('\n');
        
        // Part 2: Query from Part 1 temp table with remaining filters
        const part2Fields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
        
        // Use dev data source 1 if provided, otherwise use default with current date
        let part2SourceTable = '';
        if (config.query.dev1) {
            part2SourceTable = replaceTierInDevData(config.query.dev1, currentTierCode);
//            console.log("TIERCODE: "+currentTierCode);
//            console.log("source: "+part2SourceTable);
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
        // 3-part query
        // Part 1: Initial selection with core filters
        const part1 = [
            queryFields,
            querySource1,
            queryGenre1,
            querySendlist,
            queryWhere,
            queryMemberStatus,
            queryOptin,
            queryTier,
            queryGenre2,
            queryDOB,
            queryActiveStatus,
            queryComplaint
        ].filter(q => q !== '').join('\n');
        
        // Part 2: Query from Part 1 temp table with suppression filters
        const part2Fields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
        
        // Use dev data source 1 if provided, otherwise use default with current date
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
        const part3Fields = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]`;
        
        // Use dev data source 2 if provided, otherwise use default with current date
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


