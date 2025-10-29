// Update config object
config = {
    tier: {
        mac: { key1: "A-List Classic", key2: "MAC", checked: "" },
        mea: { key1: "A-List", key2: "MEA", checked: "" },
        mei: { key1: "Insider", key2: "MEI", checked: "" },
        mep: { key1: "Premiere", key2: "MEP", checked: "" },
        mpg: { key1: "PremiereGo", key2: "MPG", checked: "" }
    },
    genre: "NONE",
    member: { membership: "Member", activeStatus: "Active", age: "13" },
    query: { split: "1", dev1: "", dev2: "", sendlist: "", additionalFields: "",sendlistDataField: "EmailAddress",joinFieldSubscriber: "EmailAddress" },
    optIn: "None Selected",
    amcMasterSupression: "",
    associateSupression: "",
    freshAddressExclude: "",
    engagement: "",
    complaintsRemoval: ""
};

let currentTiers = []; // Array of selected tiers
let activeTier = null; // The currently displayed tier (can be null)
let activeQueryPart = 1; // The currently displayed query part (1, 2, or 3)
let generatedQueries = null; // Store the generated queries
let actionType = "";
let campaign = "genre";

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    const colors = { warning: '#f39c12', error: '#e74c3c', info: '#3498db', success: '#2ecc71' };
    notification.style.background = colors[type] || colors.success;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2500);
}

function resetAllSettings() {
    // Reset campaign type to default
    if(actionType !=="campaign"){
        document.getElementById('campaignType').value = 'genre';
        // Enable Genre selection and tab on reset
        const genreTab = document.querySelector('.dashboard-tab[data-tab="genreTargeting"]');
        const genresSelect = document.getElementById('genres');
        genreTab.classList.remove('disabled');
        genresSelect.disabled = false;
    }
    
     document.getElementById("transactionalField").style.display = "none";
    
    // Reset account types
    document.querySelectorAll('#accountTypes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Reset genre targeting
    document.getElementById('genres').selectedIndex = 0; // Select "NONE"
    
    // Reset member status
    document.getElementById('memberStatus').checked = true;
    document.getElementById('activeStatus').checked = true;
    document.getElementById('age').value = '13';
    
    // Reset query configuration
    document.getElementById('split').value = '1';
    document.getElementById('devData1').value = '';
    document.getElementById('devData2').value = '';
    document.getElementById('additonalField').value = '';
    document.getElementById('sendlistDataField').value = '';
    document.getElementById('joinFieldSubscriber').value = '';
    document.getElementById('sendlistDE').value = '';
    //Reset Split
    document.getElementById('split').disabled = false; 
    document.getElementById('split-output').disabled = false; 
    document.getElementById('split').value = 1; 
    document.getElementById('split-output').value = 1;
    // Reset email opt-in
    document.getElementById('emailOptIn').value = 'None Selected';
    
    // Reset suppression/exclude
    document.getElementById('AMC_MasterSuppression').checked = false;
    document.getElementById('Associate_Suppression').checked = false;
    document.getElementById('freshAddress').checked = false;
    
    // Reset engagement
    document.getElementById('engagementFilter').checked = false;
    document.getElementById('complaintsFilter').checked = false;
    
    // Reset tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.dashboard-tab[data-tab="accountTypes"]').classList.add('active');
    
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('accountTypes').classList.add('active');
    
    // Reset query part tabs
    document.querySelectorAll('.query-part-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.query-part-tab[data-part="1"]').classList.add('active');
    
    // Reset account type tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('disabled');
    });
    
    // Reset variables
    currentTiers = [];
    activeTier = null;
    activeQueryPart = 1;
    
    // Update config object
    config = {
        tier: {
            mac: { key1: "A-List Classic", key2: "MAC", checked: "" },
            mea: { key1: "A-List", key2: "MEA", checked: "" },
            mei: { key1: "Insider", key2: "MEI", checked: "" },
            mep: { key1: "Premiere", key2: "MEP", checked: "" },
            mpg: { key1: "PremiereGo", key2: "MPG", checked: "" }
        },
        genre: "NONE",
        member: { membership: "Member", activeStatus: "Active", age: "13" },
        query: { split: "1", dev1: "", dev2: "", sendlist: "", additionalFields: "", sendlistDataField: "EmailAddress", joinFieldSubscriber: "EmailAddress" },
        optIn: "None Selected",
        amcMasterSupression: "",
        associateSupression: "",
        freshAddressExclude: "",
        engagement: "",
        complaintsRemoval: ""
    };
    
    // Hide dev data inputs
    document.getElementById('devDataInputs').classList.remove('active');
    
    // Update query part tabs
    updateQueryPartTabs();
    
    // Update status
    updateStatus();
    
    // Update query display with reset values
    displayQuery(null, activeQueryPart);
    
    // Show notification
    showNotification('All settings have been reset to default', 'info');
}


// Generate query function for Sendlist campaigns
function generateQuerySendlist(config, tierName) {
    let ccampaign = document.getElementById('campaignType').value;
    let adF = config.query.additionalFields;
    let sDField = config.query.sendlistDataField;
    let joinField = config.query.joinFieldSubscriber;
    
    let commaSep = adF && adF.trim() !== '' ? ', ' : '';
    
    // Base SELECT clause
    let qf = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]${commaSep}${adF}`;
    
    // Transactional campaign has fewer fields
    if(ccampaign === "transactional"){
        qf = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth]${commaSep}${adF}`;
    }
    
    // FROM clause
    const qs1 = `FROM [AMC_Subscribers] AS s WITH (NOLOCK)`;
    
    // Genre JOIN (if applicable)
    const qg1 = ccampaign === 'genre' && config.genre && config.genre !== "NONE" 
        ? `INNER JOIN [AMC_Genre_targeting] al ON al.LOYALTYACCOUNTID = s.AMCStubsKobieAccountID` 
        : ``;
    
    // Sendlist JOIN - required for sendlist queries
    let qsl = ``;
    if (config.query.sendlist && config.query.sendlist.trim() !== "") {
        if(ccampaign === "transactional"){
            qsl = `INNER JOIN [${config.query.sendlist}] al ON al.[${sDField}] = s.[${joinField}]`;
        } else {
            qsl = `INNER JOIN [${config.query.sendlist}] al ON al.[${sDField}] = s.[${joinField}]`;
        }
    }
    
    // WHERE clause
    const qw = `WHERE 1=1`;
    
    // Member status filter
    const qms = `AND s.MemberStatus = '${config.member.membership}'`;
    
    // Opt-in filter
    let qo = ``;
    if (config.optIn && config.optIn !== "NA" && config.optIn !== "Not Selected" && config.optIn !== "None Selected" && config.optIn.trim() !== "") {
        qo = `AND s.[${config.optIn}] = 'Y'`;
    }
    
    // Tier filter - modified to support multiple tiers
    let qt = ``;
    if (tierName) {
        if (Array.isArray(tierName)) {
            const tierList = tierName.map(t => `'${t}'`).join(', ');
            qt = `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier IN (${tierList}) AND ActiveStatus='True')`;
        } else {
            qt = `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier = '${tierName}' AND ActiveStatus='True')`;
        }
    }
    
    // Genre filter
    const qg2 = ccampaign === 'genre' && config.genre && config.genre !== "NONE" 
        ? `AND (al.[${config.genre}] = 'True')` 
        : ``;
    
    // Age indicators filter
    let qage = ``;
    if (config.member.ageIndicators === "Y") {
        qage = `AND (s.Age13to18Indicator = 'Y' OR s.Age18to21Indicator = 'Y' OR s.Age21PlusIndicator = 'Y')`;
    }
    
    // Date of birth filter
    let qdob = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        qdob = `AND (ISNULL(s.[DateOfBirth], '') <> '' AND s.DateOfBirth <= DATEADD(year, -${parseInt(config.member.age)}, GETDATE()))`;
    }
    
    // Active subscriber status
    const qas = config.member.activeStatus === "Active" 
        ? `AND EXISTS(SELECT 1 FROM [All_Subscribers_Status_Staging] AS sub WITH (NOLOCK) WHERE s.EmailAddress = sub.SubscriberKey AND sub.Status = 'Active')` 
        : ``;
    
    // Complaints removal
    const qc = config.complaintsRemoval === "Y" 
        ? `AND NOT EXISTS(SELECT 1 FROM [_Complaint] com WITH (NOLOCK) WHERE s.EmailAddress = com.SubscriberKey)` 
        : ``;
    
    // AMC Master Suppression
    const qams = config.amcMasterSupression === "Y" 
        ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] cpesl WITH (NOLOCK) WHERE s.EmailAddress = cpesl.EmailAddress)` 
        : ``;
    
    // Associate Suppression - using COALESCE for NULL handling
    const qasup = config.associateSupression === "Y" 
        ? `AND COALESCE(s.AMCStubsCardNumber,0) NOT LIKE '1104%' AND COALESCE(s.AMCStubsCardNumber,0) NOT LIKE '11094%'` 
        : ``;
    
    // FreshAddress Exclusions
    const qfa = config.freshAddressExclude === "Y" 
        ? `AND NOT EXISTS(SELECT 1 FROM [FreshAddress_Exclusions_MRM] f WITH (NOLOCK) WHERE s.EmailAddress = f.EmailAddress)` 
        : ``;
    
    // Engagement filter
    const qe = config.engagement === "Y" 
        ? `AND (EXISTS(SELECT 1 FROM [CLICK_ENGAGEMENT_LAST_6_MONTHS] c WITH (NOLOCK) WHERE s.EmailAddress = c.SubscriberKey) OR EXISTS(SELECT 1 FROM [LastOpen_6Months] o WITH (NOLOCK) WHERE s.EmailAddress = o.EmailAddress))` 
        : ``;

    // Helper functions
    function getDate() {
        const d = new Date();
        return String(d.getFullYear()).slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }

    function replaceTier(src, code) {
        if (!src) return '';
        if (!code) return src;
        const re = /(^|[^A-Za-z0-9])(?:MAC|MEA|MEI|MEP|MPG)(?=[^A-Za-z0-9]|$)/gi;
        return src.replace(re, (m, p1) => (p1 || '') + String(code).toUpperCase());
    }

    // Get tier code if applicable
    let tcode = '';
    if (tierName && !Array.isArray(tierName)) {
        for (let k in config.tier) {
            if (config.tier[k].key1 === tierName) {
                tcode = config.tier[k].key2;
                break;
            }
        }
    }

    // Generate query based on split configuration
    if (config.query.split === "1") {
        const full = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qage, qdob, qas, qc, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
        return { full };
    } else if (config.query.split === "2") {
        const p1 = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qage, qdob, qas, qc].filter(x => x !== '').join('\n');
        const p2t = config.query.dev1 ? replaceTier(config.query.dev1, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER`;
        const p2s = `FROM [${p2t}] AS s WITH (NOLOCK)`;
        const p2 = [qf, p2s, qw, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
        return { part1: p1, part2: p2 };
    } else if (config.query.split === "3") {
        const p1 = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qage, qdob, qas, qc].filter(x => x !== '').join('\n');
        const p2t = config.query.dev1 ? replaceTier(config.query.dev1, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER_1`;
        const p2s = `FROM [${p2t}] AS s WITH (NOLOCK)`;
        const p2 = [qf, p2s, qw, qams, qasup, qfa].filter(x => x !== '').join('\n');
        const p3t = config.query.dev2 ? replaceTier(config.query.dev2, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER_2`;
        const p3s = `FROM [${p3t}] AS s WITH (NOLOCK)`;
        const p3 = [qf, p3s, qw, qe].filter(x => x !== '').join('\n');
        return { part1: p1, part2: p2, part3: p3 };
    }
}
// Generate query function
function generateQuery(config, tierName) {
    let ccampaign = document.getElementById('campaignType').value;
    let adF = config.query.additionalFields;
    let sDField = config.query.sendlistDataField;
    let joinField = config.query.joinFieldSubscriber;
    
    let commaSep = adF && adF.trim() !== '' ? ',' : '';
    
    let qf = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth], s.[Age21PlusIndicator], s.[Age18to21Indicator], s.[Age13to18Indicator], s.[AMCStubsAccountInformationEmailOptIn], s.[AMCStubsMemberRewardsSummaryEmailOptIn], s.[AMCStubsMemberRewardsEmailOptIn], s.[AMCStubsMembershipExpirationDate], s.[AMCStubsRewardsExpirationDate], s.[TotalAMCStubsRewardsBalance], s.[SpendToAMCStubsNextReward], s.[State], s.[City], s.[PostalCode], s.[PreferredTheatreNumber], s.[AMCStubsSpecialOfferOptInIndicator], s.[LoyaltyAccountType], s.[CurrentPointCount], s.[PendingPointCount]${commaSep}${adF}`;
    
    if(ccampaign === "transactional"){
        qf = `SELECT s.[EmailAddress], s.[AMCStubsCardNumber], s.[AMCStubsKobieAccountID], s.[MemberStatus], s.[FirstName], s.[LastName], s.[DateOfBirth]${commaSep}${adF}`;
    }
    const qs1 = `FROM [AMC_Subscribers] AS s WITH (NOLOCK)`;
    const qg1 = ccampaign === 'genre' && config.genre && config.genre !== "NONE" ? `INNER JOIN [AMC_Genre_targeting] al ON al.LOYALTYACCOUNTID = s.AMCStubsKobieAccountID` : ``;
    let qsl = ``;
    if (config.query.sendlist && config.query.sendlist.trim() !== "") {
        qsl = `INNER JOIN [${config.query.sendlist}] al ON al.[EmailAddress] = s.[EmailAddress]`;
    }
    if(ccampaign === "transactional"){
        qsl = `INNER JOIN [${config.query.sendlist}] al ON al.[${sDField}] = s.[${joinField}]`;
    }
    const qw = `WHERE 1=1`;
    const qms = `AND s.MemberStatus = '${config.member.membership}'`;
    let qo = ``;
    // Modified condition to exclude "Not Selected", "NA", and empty string
    if (config.optIn && config.optIn !== "NA" && config.optIn !== "Not Selected" && config.optIn !== "None Selected" && config.optIn.trim() !== "") {
        qo = `AND s.[${config.optIn}] = 'Y'`;
    }
    // Only add tier condition if a tier is specified
    const qt = tierName ? `AND s.LoyaltyAccountPortfolioID IN (SELECT LoyaltyAccountPortfolioID FROM [Master_LoyaltyPortfolioID] WHERE Tier = '${tierName}' AND ActiveStatus='True')` : ``;
    // Only add genre WHERE clause if the campaign type is 'genre' AND a genre is selected
    const qg2 = ccampaign === 'genre' && config.genre && config.genre !== "NONE" ? `AND (al.[${config.genre}] = 'True')` : ``;
    let qdob = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        qdob = `AND (ISNULL(s.[DateOfBirth], '') <> '' AND s.DateOfBirth <= DATEADD(year, -${parseInt(config.member.age)}, GETDATE()))`;
    }
    const qas = config.member.activeStatus === "Active" ? `AND EXISTS (SELECT 1 FROM All_Subscribers_Status_Staging AS sub WITH (NOLOCK) WHERE s.EmailAddress = sub.SubscriberKey AND sub.Status = 'Active')` : ``;
    const qc = config.complaintsRemoval === "Y" ? `AND NOT EXISTS (SELECT 1 FROM _Complaint AS com WITH (NOLOCK) WHERE s.EmailAddress = com.SubscriberKey)` : ``;
    const qams = config.amcMasterSupression === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] AS cpesl WITH (NOLOCK) WHERE s.EmailAddress = cpesl.EmailAddress)` : ``;
    const qasup = config.associateSupression === "Y" ? `AND s.amcStubsCardNumber IS NOT NULL AND s.amcStubsCardNumber NOT LIKE '1104%' AND s.amcStubsCardNumber NOT LIKE '11094%'` : ``;
    const qfa = config.freshAddressExclude === "Y" ? `AND NOT EXISTS ( SELECT 1 FROM FreshAddress_Exclusions_MRM AS f WITH (NOLOCK) WHERE s.EmailAddress = f.EmailAddress)` : ``;
    const qe = config.engagement === "Y" ? `AND (EXISTS (SELECT 1 FROM CLICK_ENGAGEMENT_LAST_6_MONTHS AS c WITH (NOLOCK) WHERE s.EmailAddress = c.SubscriberKey) OR EXISTS (SELECT 1 FROM LastOpen_6Months AS o WITH (NOLOCK) WHERE s.EmailAddress = o.EmailAddress))` : ``;

    function getDate() {
        const d = new Date();
        return String(d.getFullYear()).slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }

    function replaceTier(src, code) {
        if (!src) return '';
        if (!code) return src;
        const re = /(^|[^A-Za-z0-9])(?:MAC|MEA|MEI|MEP|MPG)(?=[^A-Za-z0-9]|$)/gi;
        return src.replace(re, (m, p1) => (p1 || '') + String(code).toUpperCase());
    }

    let tcode = '';
    if (tierName) {
        for (let k in config.tier) {
            if (config.tier[k].key1 === tierName) {
                tcode = config.tier[k].key2;
                break;
            }
        }
    }

    if (config.query.split === "1") {
        const full = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qdob, qas, qc, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
        return { full };
    } else if (config.query.split === "2") {
        const p1 = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qdob, qas, qc].filter(x => x !== '').join('\n');
        const p2t = config.query.dev1 ? replaceTier(config.query.dev1, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER`;
        const p2s = `FROM [${p2t}] AS s WITH (NOLOCK)`;
        const p2 = [qf, p2s, qw, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
        return { part1: p1, part2: p2 };
    } else if (config.query.split === "3") {
        const p1 = [qf, qs1, qg1, qsl, qw, qms, qo, qt, qg2, qdob, qas, qc].filter(x => x !== '').join('\n');
        const p2t = config.query.dev1 ? replaceTier(config.query.dev1, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER_1`;
        const p2s = `FROM [${p2t}] AS s WITH (NOLOCK)`;
        const p2 = [qf, p2s, qw, qams, qasup, qfa].filter(x => x !== '').join('\n');
        const p3t = config.query.dev2 ? replaceTier(config.query.dev2, tcode) : `DEV_${getDate()}_${tcode || 'ALL'}_PLACEHOLDER_2`;
        const p3s = `FROM [${p3t}] AS s WITH (NOLOCK)`;
        const p3 = [qf, p3s, qw, qe].filter(x => x !== '').join('\n');
        return { part1: p1, part2: p2, part3: p3 };
    }
}

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
    
    const qw = `WHERE s.MemberStatus = '${config.member.membership}'`;
    
    // Opt-in condition
    let qo = ``;
    if (config.optIn && config.optIn !== "NA" && config.optIn !== "Not Selected" && config.optIn !== "None Selected" && config.optIn.trim() !== "") {
        qo = `AND s.[${config.optIn}] = 'Y'`;
    }
    
    // Tier condition
    const qt = tierName ? `AND s.LoyaltyAccountPortfolioID IN ('${tierName}')` : ``;
    
    // Age condition - using DATEDIFF to match the template
    let qdob = ``;
    if (config.member.age && config.member.age !== "NA" && !isNaN(config.member.age)) {
        qdob = `AND DATEDIFF(yy, s.DateOfBirth, GETDATE()) >= ${parseInt(config.member.age)}`;
    }
    
    // Active status condition - updated to match the template
    const qas = config.member.activeStatus === "Active" ? `AND EXISTS(SELECT 1 FROM All_Subscribers_Status_Staging sub WITH(NOLOCK) WHERE sub.SubscriberKey = s.EmailAddress AND sub.Status='Active')` : ``;
    
    // Complaint removal condition - updated to match the template
    const qc = config.complaintsRemoval === "Y" ? `AND NOT EXISTS(SELECT 1 FROM _Complaint c WITH(NOLOCK) WHERE c.SubscriberKey = s.EmailAddress)` : ``;
    
    // AMC master suppression condition - updated to match the template
    const qams = config.amcMasterSupression === "Y" ? `AND NOT EXISTS(SELECT 1 FROM [AMC_MasterSuppression] m WITH(NOLOCK) WHERE m.EmailAddress = s.EmailAddress)` : ``;
    
    // Associate suppression condition - updated to match the template
    const qasup = config.associateSupression === "Y" ? `AND COALESCE(s.AMCStubsCardNumber, '') NOT LIKE '1104%' AND COALESCE(s.AMCStubsCardNumber, '') NOT LIKE '11094%'` : ``;
    
    // Fresh address exclusion condition - updated to match the template
    const qfa = config.freshAddressExclude === "Y" ? `AND NOT EXISTS(SELECT 1 FROM FreshAddress_Exclusions_MRM f WITH(NOLOCK) WHERE f.EmailAddress = s.EmailAddress)` : ``;
    
    // Engagement condition - updated to match the template with proper parentheses
    const qe = config.engagement === "Y" ? `AND (EXISTS(SELECT 1 FROM CLICK_ENGAGEMENT_LAST_6_MONTHS c WITH(NOLOCK) WHERE c.SubscriberKey = s.EmailAddress) OR EXISTS(SELECT 1 FROM LastOpen_6Months o WITH(NOLOCK) WHERE o.EmailAddress = s.EmailAddress))` : ``;
    
    // Combine all parts to form the complete query
    const full = [qf, qs1, qsl, qw, qo, qt, qdob, qas, qc, qams, qasup, qfa, qe].filter(x => x !== '').join('\n');
    
    return { full };
}

// Escape HTML function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Query copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy query', 'error');
    });
}

// Update status function
function updateStatus() {
    const statusContent = document.getElementById('statusContent');
    let statusHTML = '';
    
    // Account Types
    statusHTML += '<div class="status-section">';
    statusHTML += '<div class="status-label">Account Types:</div>';
    const selectedTiers = [];
    document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').forEach(cb => {
        selectedTiers.push(cb.dataset.tierName);
    });
    statusHTML += '<div class="status-value">' + 
        (selectedTiers.length > 0 ? selectedTiers.join(', ') : '<span class="status-empty">None selected (All)</span>') + 
        '</div>';
    statusHTML += '</div>';
    
    // Genre Targeting
    statusHTML += '<div class="status-section">';
    statusHTML += '<div class="status-label">Targeting:</div>';

    const selectedGenres = Array.from(document.getElementById('genres').selectedOptions).map(option => option.value);
    const hasGenres = selectedGenres.length > 0 && selectedGenres[0] !== "NONE";
    const hasSendlist = config.query.sendlist && config.query.sendlist.trim() !== "";

    let displayValue = '';
    const noneValue = '<span class="status-empty">None selected</span>';

    if (hasGenres && hasSendlist) {
        // Both Genre and Sendlist have values - concatenate them
        const genreText = selectedGenres.slice(0, 3).join(', ') + (selectedGenres.length > 3 ? '...' : '');
        displayValue = `Genre: ${genreText}, Sendlist: ${config.query.sendlist}`;
    } else if (hasGenres) {
        // Only Genre has value
        displayValue = selectedGenres.slice(0, 3).join(', ') + (selectedGenres.length > 3 ? '...' : '');
    } else if (hasSendlist) {
        // Only Sendlist has value
        displayValue = config.query.sendlist;
    } else {
        // Neither has value
        displayValue = '<span class="status-empty">None selected</span>';
    }

    statusHTML += `<div class="status-value">${displayValue}</div>`;
    statusHTML += '</div>';
    
    // Member Status
    statusHTML += '<div class="status-section">';
    statusHTML += '<div class="status-label">Member Status:</div>';
    const isMember = document.getElementById('memberStatus').checked;
    const isActive = document.getElementById('activeStatus').checked;
    const ageFilter = document.getElementById('age').value;
    statusHTML += '<div class="status-value">' + 
        (isMember ? 'Member' : 'Non-Member') + 
        ', Age: ' + ageFilter + '+, Active: ' + (isActive ? 'Yes' : 'No') + 
        '</div>';
    statusHTML += '</div>';
    
    // Query Config
    statusHTML += '<div class="status-section">';
    statusHTML += '<div class="status-label">Query Settings:</div>';
    const splitValue = document.getElementById('split').value;
    let configText = splitValue + ' (';
    if (splitValue === '1') configText += 'Single Query';
    else if (splitValue === '2') configText += 'Split to 2 Parts';
    else if (splitValue === '3') configText += 'Split to 3 Parts';
    configText += ')';
    const devData1 = document.getElementById('devData1').value;
    const devData2 = document.getElementById('devData2').value;
    if (devData1) configText += ', Dev1: ' + devData1;
    if (devData2) configText += ', Dev2: ' + devData2;
    statusHTML += '<div class="status-value">' + configText + '</div>';
    statusHTML += '</div>';
    
    // Email & Engagement
    statusHTML += '<div class="status-section">';
    statusHTML += '<div class="status-label">Filters & Exclusions:</div>';
    const emailOptIn = document.getElementById('emailOptIn');
    const emailOptInValue = emailOptIn.value;
    let emailText = emailOptInValue !== '' ? emailOptIn.options[emailOptIn.selectedIndex].text : noneValue;
    
    // Add suppression info
    const amcSuppression = document.getElementById('AMC_MasterSuppression').checked;
    const associateSuppression = document.getElementById('Associate_Suppression').checked;
    const freshAddress = document.getElementById('freshAddress').checked;
    const suppressionOptions = [];
    if (amcSuppression) suppressionOptions.push('AMC_MasterSuppression');
    if (associateSuppression) suppressionOptions.push('Associate Suppression(1104%/11094%)');
    if (freshAddress) suppressionOptions.push('Exclude Fresh Address');
    if (suppressionOptions.length > 0) {
        emailText += '<br>' + suppressionOptions.join('<br>');
    }

    
    // Add engagement info
    const engagementFilter = document.getElementById('engagementFilter').checked;
    const complaintsFilter = document.getElementById('complaintsFilter').checked;
    const engagementOptions = [];
    if (engagementFilter) engagementOptions.push('Engagement: Open and Click 6 Months');
    if (complaintsFilter) engagementOptions.push('Complaints Removal');
    if (engagementOptions.length > 0) {
        emailText += '<br>' + engagementOptions.join('<br>');
    }
    statusHTML += '<div class="status-value">' + emailText + '</div>';
    statusHTML += '</div>';
    
    statusContent.innerHTML = statusHTML;
}

// Display query function
// Display query function
function displayQuery(tierName, part = 1) {
    const output = document.getElementById('queryOutput');
    const label = document.getElementById('queryPartLabel');
    const btn = document.getElementById('copyButton');
    
    // Store the generated queries
    if(campaign === "transactional"){
        generatedQueries = generateQueryTransactional(config, tierName);
    }else if(campaign ==="genre"){
        generatedQueries = generateQuery(config, tierName);
    }else if(campaign === "sendlist"){
        generatedQueries = generateQuerySendlist(config, tierName);
    }
    
    // Update label based on whether we have a specific tier or not
    if (tierName) {
        if (config.query.split === "1") {
            label.textContent = `Query for ${tierName}`;
        } else {
            label.textContent = `Query Part ${part} for ${tierName}`;
        }
    } else {
        if (config.query.split === "1") {
            label.textContent = `Query (All Account Types)`;
        } else {
            label.textContent = `Query Part ${part} (All Account Types)`;
        }
    }

    // Display only the requested part and set up copy button
    if (config.query.split === "1") {
        output.innerHTML = `<pre><code class="language-sql">${escapeHtml(generatedQueries.full)}</code></pre>`;
        btn.style.display = 'block';
        btn.onclick = () => copyToClipboard(generatedQueries.full);
    } else if (config.query.split === "2") {
        let currentQuery;
        if (part === 1) {
            currentQuery = generatedQueries.part1;
            output.innerHTML = `<pre><code class="language-sql">${escapeHtml(currentQuery)}</code></pre>`;
        } else {
            currentQuery = generatedQueries.part2;
            output.innerHTML = `<pre><code class="language-sql">${escapeHtml(currentQuery)}</code></pre>`;
        }
        btn.style.display = 'block';
        // Copy only the currently visible part
        btn.onclick = () => copyToClipboard(currentQuery);
    } else if (config.query.split === "3") {
        let currentQuery;
        if (part === 1) {
            currentQuery = generatedQueries.part1;
            output.innerHTML = `<pre><code class="language-sql">${escapeHtml(currentQuery)}</code></pre>`;
        } else if (part === 2) {
            currentQuery = generatedQueries.part2;
            output.innerHTML = `<pre><code class="language-sql">${escapeHtml(currentQuery)}</code></pre>`;
        } else {
            currentQuery = generatedQueries.part3;
            output.innerHTML = `<pre><code class="language-sql">${escapeHtml(currentQuery)}</code></pre>`;
        }
        btn.style.display = 'block';
        // Copy only the currently visible part
        btn.onclick = () => copyToClipboard(currentQuery);
    }
    
    // Re-highlight the code
    Prism.highlightAll();
}

// Tab switching functionality
document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding section
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Account type checkbox handling
document.querySelectorAll('#accountTypes input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
        // Update current tiers array
        currentTiers = [];
        document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').forEach(checkbox => {
            currentTiers.push({
                id: checkbox.id,
                name: checkbox.dataset.tierName
            });
        });
        
        // Update tab states
        document.querySelectorAll('.tab').forEach(tab => {
            const tierId = tab.getAttribute('data-tab');
            const isChecked = document.getElementById(tierId).checked;
            
            if (isChecked) {
                tab.classList.remove('disabled');
                // If this is the first checked tab or no active tier, make it active
                if (!activeTier || !document.getElementById(activeTier).checked) {
                    tab.classList.add('active');
                    activeTier = tierId;
                } else {
                    tab.classList.remove('active');
                }
            } else {
                tab.classList.add('disabled');
                tab.classList.remove('active');
                // If the active tier was unchecked, set the first checked tier as active
                if (activeTier === tierId && currentTiers.length > 0) {
                    activeTier = currentTiers[0].id;
                    document.querySelector(`.tab[data-tab="${activeTier}"]`).classList.add('active');
                } else if (activeTier === tierId && currentTiers.length === 0) {
                    activeTier = null;
                }
            }
        });
        
        // Update query part tabs
        updateQueryPartTabs();
        
        // Display query for the active tier or all tiers if none selected
        if (activeTier) {
            const activeCheckbox = document.getElementById(activeTier);
            displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
        } else {
            displayQuery(null, activeQueryPart);
        }
        
        // Update status
        updateStatus();
    });
});

// Tab switching for account types
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        if (this.classList.contains('disabled')) return;
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update active tier
        const tierId = this.getAttribute('data-tab');
        activeTier = tierId;
        
        // Display query for the selected tier
        const tierCheckbox = document.getElementById(tierId);
        if (tierCheckbox) {
            displayQuery(tierCheckbox.dataset.tierName, activeQueryPart);
        }
    });
});

// Query part tab switching
document.querySelectorAll('.query-part-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        if (this.classList.contains('disabled')) return;
        
        // Remove active class from all tabs
        document.querySelectorAll('.query-part-tab').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update active query part
        activeQueryPart = parseInt(this.getAttribute('data-part'));
        
        // Display the selected part
        if (activeTier) {
            const activeCheckbox = document.getElementById(activeTier);
            displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
        } else {
            displayQuery(null, activeQueryPart);
        }
    });
});

// Update query part tabs based on split value
function updateQueryPartTabs() {
    const splitValue = document.getElementById('split').value;
    const queryPartTabs = document.querySelectorAll('.query-part-tab');
    
    queryPartTabs.forEach((tab, index) => {
        tab.classList.remove('active', 'disabled');
        if (index >= parseInt(splitValue)) {
            tab.classList.add('disabled');
        } else if (index === 0) {
            tab.classList.add('active');
            activeQueryPart = 1; // Reset to first part when split changes
        }
    });
}

// Event listeners for form controls
//SPLIT CHANGE
document.getElementById('split').addEventListener('change', e => {
    config.query.split = e.target.value;
    document.getElementById('split-output').value = e.target.value;
    // Show/hide dev data inputs based on split value
    const devDataInputs = document.getElementById('devDataInputs');
    const devData2 = document.getElementById('devData2').parentElement; // Get the parent div
    
    if (e.target.value === "1") {
        devDataInputs.classList.remove('active');
    } else if (e.target.value === "2") {
        devDataInputs.classList.add('active');
        devData2.style.display = 'none'; // Hide DEV data source 2
    } else if (e.target.value === "3") {
        devDataInputs.classList.add('active');
        devData2.style.display = 'block'; // Show DEV data source 2
    }
    
    updateQueryPartTabs();
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('split-output').addEventListener('change', e => {
    config.query.split = e.target.value;
    document.getElementById('split').value = e.target.value;
    
    // Switch to Query Settings tab
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector('.dashboard-tab[data-tab="queryConfig"]').classList.add('active');
    document.getElementById('queryConfig').classList.add('active');
    
    
    // Show/hide dev data inputs based on split value
    const devDataInputs = document.getElementById('devDataInputs');
    const devData2 = document.getElementById('devData2').parentElement; // Get the parent div
    
    if (e.target.value === "1") {
        devDataInputs.classList.remove('active');
    } else if (e.target.value === "2") {
        devDataInputs.classList.add('active');
        devData2.style.display = 'none'; // Hide DEV data source 2
    } else if (e.target.value === "3") {
        devDataInputs.classList.add('active');
        devData2.style.display = 'block'; // Show DEV data source 2
    }
    
    
    
    
    updateQueryPartTabs();
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('devData1').addEventListener('input', e => {
    config.query.dev1 = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('devData2').addEventListener('input', e => {
    config.query.dev2 = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('sendlistDE').addEventListener('input', e => {
    config.query.sendlist = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('additonalField').addEventListener('input', e => {
    config.query.additionalFields = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('sendlistDataField').addEventListener('input', e => {
    config.query.sendlistDataField = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('joinFieldSubscriber').addEventListener('input', e => {
    config.query.joinFieldSubscriber = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('memberStatus').addEventListener('change', e => {
    config.member.membership = e.target.checked ? "Member" : "Non-Member";
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('activeStatus').addEventListener('change', e => {
    config.member.activeStatus = e.target.checked ? "Active" : "Inactive";
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('age').addEventListener('change', e => {
    config.member.age = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('genres').addEventListener('change', e => {
    // Get selected options
    const selectedOptions = Array.from(e.target.selectedOptions);
    
    // If "NONE" is selected with other options, unselect "NONE"
    if (selectedOptions.length > 1 && selectedOptions.some(option => option.value === "NONE")) {
        const noneOption = e.target.querySelector('option[value="NONE"]');
        noneOption.selected = false;
    }
    
    // If no options are selected, select "NONE"
    if (e.target.selectedOptions.length === 0) {
        const noneOption = e.target.querySelector('option[value="NONE"]');
        noneOption.selected = true;
    }
    
    // Get the first selected non-NONE option
    const selectedGenre = Array.from(e.target.selectedOptions).find(option => option.value !== "NONE");
    config.genre = selectedGenre ? selectedGenre.value : "NONE";
    
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('emailOptIn').addEventListener('change', e => {
    config.optIn = e.target.value;
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('AMC_MasterSuppression').addEventListener('change', e => {
    config.amcMasterSupression = e.target.checked ? 'Y' : '';
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('Associate_Suppression').addEventListener('change', e => {
    config.associateSupression = e.target.checked ? 'Y' : '';
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('freshAddress').addEventListener('change', e => {
    config.freshAddressExclude = e.target.checked ? 'Y' : '';
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('engagementFilter').addEventListener('change', e => {
    config.engagement = e.target.checked ? 'Y' : '';
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

document.getElementById('complaintsFilter').addEventListener('change', e => {
    config.complaintsRemoval = e.target.checked ? 'Y' : '';
    if (activeTier) {
        const activeCheckbox = document.getElementById(activeTier);
        displayQuery(activeCheckbox.dataset.tierName, activeQueryPart);
    } else {
        displayQuery(null, activeQueryPart);
    }
    updateStatus();
});

// Campaign Type selector event listener
document.getElementById('campaignType').addEventListener('change', e => {
    const campaignType = e.target.value;
    actionType = "campaign";
    campaign = e.target.value;
    resetAllSettings();
    // Reset all tabs to inactive
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove highlight from sendlistDE field
    document.getElementById('sendlistDE').style.backgroundColor = '';
    
    // Enable split selector by default
    document.getElementById('split').disabled = false;
    
    // Handle Genre selection and tab
    const genreTab = document.querySelector('.dashboard-tab[data-tab="genreTargeting"]');
    const genresSelect = document.getElementById('genres');
    
    if (campaignType === 'genre') {
        // Enable Genre selection and tab
        genreTab.classList.remove('disabled');
        genresSelect.disabled = false;
    } else {
        // Disable Genre selection and tab
        genreTab.classList.add('disabled');
        genresSelect.disabled = true;
    }
    
    if (campaignType === 'genre') {
        // Show Genre Dashboard
        document.querySelector('.dashboard-tab[data-tab="genreTargeting"]').classList.add('active');
        document.getElementById('genreTargeting').classList.add('active');
    } else if (campaignType === 'sendlist') {
        // Show Query Settings and highlight Sendlist DE field
        document.querySelector('.dashboard-tab[data-tab="queryConfig"]').classList.add('active');
        document.getElementById('queryConfig').classList.add('active');
        
        // Highlight sendlistDE field
        document.getElementById('sendlistDE').style.backgroundColor = '#fff9db';
        document.getElementById("transactionalField").style.display = "block";
    } else if (campaignType === 'transactional') {
        // Go to Query Settings and disable Split selector
        document.querySelector('.dashboard-tab[data-tab="queryConfig"]').classList.add('active');
        document.getElementById('queryConfig').classList.add('active');
        
        // Disable split selector
        document.getElementById('split').disabled = true;
        document.getElementById('split').value = '1';
        
        document.getElementById('split-output').disabled = true;
        document.getElementById('split-output').value = '1';
        config.query.split = '1';
        
        document.getElementById("transactionalField").style.display = "block";
        
        // Hide dev data inputs
        document.getElementById('devDataInputs').classList.remove('active');
        
        // Update query part tabs
        updateQueryPartTabs();
    }
    
    updateStatus();
});

// Reset button click handler
document.getElementById('generateButton').addEventListener('click', () => {
    actionType = "";
    resetAllSettings();
});

// Initialize status on load
updateStatus();

// Initialize query display on load
displayQuery(null, 1);

// Initialize query part tabs
updateQueryPartTabs();

// Make entire checkbox-item divs clickable
document.querySelectorAll('.checkbox-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Prevent double-triggering if clicking directly on checkbox or label
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
            return;
        }

        // Find the checkbox inside this item
        const checkbox = this.querySelector('input[type="checkbox"]');
        if (checkbox) {
            // Toggle the checkbox
            checkbox.checked = !checkbox.checked;

            // Trigger the change event to update everything
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
});