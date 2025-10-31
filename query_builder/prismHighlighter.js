/**
 * Recursively collects all non-empty string values from an object.
 */
const customConfig = {
  key1: "AMC_Genre_targeting",
  key2: "Sendlist",
  key3: "Member",
  key4: "s.MemberStatus",
  key5: "sub.Status =",
  key6: "Tier",
  key7: "ACTION",
  key8: "ADVENTURE",
  key9: "ANIMATION",
  key10: "CLASSIC_CONCERT",
  key11: "COMEDY",
  key12: "DANCE",
  key13: "DOCUMENTARY",
  key14: "DRAMA",
  key15: "FAMILY",
  key16: "FANTASY",
  key17: "HORROR",
  key18: "MUSICAL",
  key19: "OPERA",
  key20: "ROCK_POP_CONCERT",
  key21: "ROMANCE",
  key22: "ROMANTIC_COMEDY",
  key23: "SCIENCE_FICTION",
  key24: "SPECIAL_EVENTS",
  key25: "SUSPENSE",
  key26: "THEATRE",
  key27: "WESTERN",
  key28: "ANIME",
  key29: "ARTISAN",
  key30: "THRILLS_AND_CHILLS",
  key31: "year, -13",
  key32: "year, -18",
  key33: "year, -21",
  key34: "_Complaint",
  key35: "AMC_MasterSuppression",
  key36: "AND s.[AMCStubsSpecialOfferOptInIndicator]",
  key37: "AND s.[AMCMyMoviesQueueOptIn]",
  key38: "AND s.[AMCStubsAccountInformationEmailOptin]",
  key39: "AND s.[AMCStubsMemberRewardsEmailOptin]",
  key40: "AND s.[AMCStubsMemberRewardsSummaryEmailOptIn]",
  key41: "FreshAddress_Exclusions_MRM",
  key42: "CLICK_ENGAGEMENT_LAST_6_MONTHS",
  key43: "LastOpen_6Months",
  key44: "sub.Status=",
  key45: "INNER JOIN",
  key46: ">= 13",
  key47: ">= 18",
  key48: ">= 21",
  key49: "WHERE Tier =",
  key50: "AND s.DateOfBirth",
  key51: "DEV1_PLACEHOLDER",
  key52: "DEV2_PLACEHOLDER",
  key53: "PLACEHOLDER_Sendlist",
  sendList:"PLACEHOLDER_Sendlist",
  addField:"",
  joinField:"",
  devData1:"DEV1_PLACEHOLDER",
  devData2:"DEV2_PLACEHOLDER"
};
function collectValues(obj, values = new Set()) {
    for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'string' && val.trim() !== '') {
            values.add(val.trim());
        } else if (typeof val === 'object' && val !== null) {
            collectValues(val, values);
        }
    }
    return values;
}

/**
 * Adds Prism highlight rules for all non-empty config values.
 */
function highlightConfigValues(config, language = 'sql') {
    // Reset Prism languages to avoid duplicate rules
    Prism.languages.sql = Prism.languages.extend('sql', {});
    
    // Remove any existing config-values rule
    if (Prism.languages.sql['config-values']) {
        delete Prism.languages.sql['config-values'];
    }
    
    const values = collectValues(config);
    if (values.size === 0) return;
    
    const combinedPattern = Array.from(values)
        .map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex
        .join('|');
    
    const customRule = {
        pattern: new RegExp(`(?<![\\w'])(${combinedPattern})(?![\\w'])`, 'g'),
        alias: 'config-highlight'
    };
    
    Prism.languages.insertBefore(language, 'keyword', {
        'config-values': customRule
    });
    
    // Re-highlight after adding new token
    Prism.highlightAll();
    
    return values;
}

/**
 * Updates the query output with a new SQL query and applies highlighting
 */
function updateQueryOutput(sqlQuery) {
    const queryOutput = document.getElementById('queryOutput');
    queryOutput.innerHTML = `<pre class="line-numbers"><code class="language-sql">${sqlQuery}</code></pre>`;
    
    // Apply highlighting using customConfig
    highlightConfigValues(customConfig);
}