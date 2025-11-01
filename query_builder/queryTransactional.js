// Generate query function for transactional campaigns
function generateQueryTransactional(config, tierName) {
    let adF = config.query.additionalFields;
    let sDField = config.query.sendlistDataField;
    let joinField = config.query.joinFieldSubscriber;
    
    let commaSep = adF && adF.trim() !== '' ? ',' : '';
    
    // For transactional campaigns, we only need these fields
    let qf = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth]${commaSep}${adF}`;
    
    const qs1 = `FROM [AMC_Subscribers] AS s WITH (NOLOCK)`;
    
    // For transactional campaigns, we always join with the sendlist
    let qsl = `INNER JOIN [${config.query.sendlist}] al ON al.[${sDField}] = s.[${joinField}]`;
    
    const qw = `WHERE 1=1`;
    const qms = `AND s.MemberStatus = '${config.member.membership}'`;
    
    // Opt-in condition
    let qo = ``;
    if (config.optIn && config.optIn !== "NA" && config.optIn !== "Not Selected" && config.optIn !== "None Selected" && config.optIn.trim() !== "") {
        qo = `AND s.[${config.optIn}] = 'Y'`;
    }
    
    // Tier condition
    const qt = tierName ? `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier = '${tierName}' AND ActiveStatus='True')` : ``;
    
    // Age condition - using DATEDIFF to match the template
    let qdob = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        qdob = `AND (ISNULL(s.[DateOfBirth], '') <> '' AND DATEDIFF(yy, s.DateOfBirth, GETDATE()) >= ${parseInt(config.member.age)})`;
    }
    
    // Active status condition - updated to match the template
    const qas = config.member.activeStatus === "Active" ? `AND EXISTS (SELECT 1 FROM All_Subscribers_Status_Staging AS sub WITH (NOLOCK) WHERE sub.SubscriberKey = s.EmailAddress AND sub.Status = 'Active')` : ``;
    
    // Complaint removal condition - updated to match the template
    const qc = config.complaintsRemoval === "Y" ? `AND NOT EXISTS (SELECT 1 FROM _Complaint AS com WITH (NOLOCK) WHERE com.SubscriberKey = s.EmailAddress)` : ``;
    
    // AMC master suppression condition - updated to match the template
    const qams = config.amcMasterSupression === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] AS cpesl WITH (NOLOCK) WHERE cpesl.EmailAddress = s.EmailAddress)` : ``;
    
    // Associate suppression condition - updated to match the template
    const qasup = config.associateSupression === "Y" ? `AND COALESCE(s.AMCStubsCardNumber, '') NOT LIKE '1104%' AND COALESCE(s.AMCStubsCardNumber, '') NOT LIKE '11094%'` : ``;
    
    // Fresh address exclusion condition - updated to match the template
    const qfa = config.freshAddressExclude === "Y" ? `AND NOT EXISTS ( SELECT 1 FROM FreshAddress_Exclusions_MRM AS f WITH (NOLOCK) WHERE f.EmailAddress = s.EmailAddress)` : ``;
    
    // Engagement condition - updated to match the template
    const qe = config.engagement === "Y" ? `AND (EXISTS (SELECT 1 FROM CLICK_ENGAGEMENT_LAST_6_MONTHS AS c WITH (NOLOCK) WHERE c.SubscriberKey = s.EmailAddress) OR EXISTS (SELECT 1 FROM LastOpen_6Months AS o WITH (NOLOCK) WHERE o.EmailAddress = s.EmailAddress))` : ``;

    // Combine all parts to form the complete query
    const fullQuery = [qf, qs1, qsl, qw, qms, qo, qt, qdob, qas, qc, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
    
    return { part1: fullQuery };
}