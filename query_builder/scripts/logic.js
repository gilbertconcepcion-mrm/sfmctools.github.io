// Dashboard tab functionality
window.currentSettings = {}; // accessible from anywhere
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and sections
            dashboardTabs.forEach(t => t.classList.remove('active'));
            dashboardSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

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
    // Query tab functionality
    const queryTabs = document.querySelectorAll('.tab');
    let currentAccountType = null; // No default account type

    queryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Only allow clicking on enabled tabs
            if (this.classList.contains('disabled')) {
                return;
            }

            // Remove active class from all tabs
            queryTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            currentAccountType = this.getAttribute('data-tab');

            // Generate queries for all selected account types when a tab is clicked
            generateAllQueries();

            // Update number buttons based on split value
            updateNumberButtons();

            // Reset to part 1 when switching account types
            resetToPart1();

            // Update the query part label
            updateQueryPartLabel();

            // Update the query output with the current part
            updateQueryOutput();
        });
    });

    // Function to reset to part 1
    function resetToPart1() {
        // Reset currentPart to 1
        currentPart = 1;

        // Update query part tabs to show part 1 as active
        queryPartTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.query-part-tab[data-part="1"]').classList.add('active');
    }

    // Query part tab functionality
    const queryPartTabs = document.querySelectorAll('.query-part-tab');
    let currentPart = 1; // Default to part 1

    queryPartTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Only allow clicking if there's an active account type and tab is not disabled
            if (!currentAccountType || this.classList.contains('disabled')) {
                return;
            }

            // Generate queries for all selected account types when a part tab is clicked
            generateAllQueries();

            // Remove active class from all tabs
            queryPartTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            currentPart = parseInt(this.getAttribute('data-part'));

            // Update the query part label
            updateQueryPartLabel();

            // Update the query output with the current part
            updateQueryOutput();
        });
    });

    // Function to update number buttons based on split value
    function updateNumberButtons() {
        const splitValue = parseInt(document.getElementById('split').value);

        queryPartTabs.forEach(tab => {
            const partNum = parseInt(tab.getAttribute('data-part'));

            // If there's an active account type and the part number is within the split range
            if (currentAccountType && partNum <= splitValue) {
                tab.classList.remove('disabled');
            } else {
                tab.classList.add('disabled');
            }
        });

        // If current part is now disabled (because split value changed), reset to part 1
        if (currentPart > splitValue) {
            resetToPart1();
            updateQueryPartLabel();
            updateQueryOutput();
        }
    }

    // Function to update query part label
    function updateQueryPartLabel() {
        const queryPartLabel = document.getElementById('queryPartLabel');
        const accountTypeNames = {
            'mac': 'MAC',
            'mea': 'MEA',
            'mei': 'MEI',
            'mep': 'MEP',
            'mpg': 'MPG'
        };

        if (currentAccountType) {
            const splitValue = document.getElementById('split').value;
            if (splitValue === "1") {
                queryPartLabel.textContent = `${accountTypeNames[currentAccountType]} Query`;
            } else {
                queryPartLabel.textContent = `${accountTypeNames[currentAccountType]} Part ${currentPart}`;
            }
        } else {
            queryPartLabel.textContent = 'Select an account type';
        }
    }

    // Function to update query output with syntax highlighting
    function updateQueryOutput() {
        const queryOutput = document.getElementById('queryOutput');

        if (!currentAccountType) {
            queryOutput.innerHTML = '<pre><code class="language-sql">-- Select an account type to view queries</code></pre>';
            Prism.highlightElement(queryOutput.querySelector('code'));
            return;
        }

        const splitValue = document.getElementById('split').value;
        let queryId;

        if (splitValue === "1") {
            // For single query, use the full query
            queryId = `${currentAccountType}-full`;
        } else {
            // For split queries, use the part
            queryId = `${currentAccountType}-part${currentPart}`;
        }

        // Check if we have a generated query for this account type and part
        if (window.generatedQueries && window.generatedQueries[queryId]) {
            queryOutput.innerHTML = `<pre><code class="language-sql">${escapeHtml(window.generatedQueries[queryId])}</code></pre>`;
            Prism.highlightElement(queryOutput.querySelector('code'));
        } else {
            queryOutput.innerHTML = '<pre><code class="language-sql">-- SQL query will be generated here</code></pre>';
            Prism.highlightElement(queryOutput.querySelector('code'));
        }
    }

    // Function to escape HTML characters
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Copy button functionality
    const copyButton = document.getElementById('copyButton');

    copyButton.addEventListener('click', function() {
        if (!currentAccountType) {
            return;
        }

        const splitValue = document.getElementById('split').value;
        let queryId;

        if (splitValue === "1") {
            queryId = `${currentAccountType}-full`;
        } else {
            queryId = `${currentAccountType}-part${currentPart}`;
        }

        let queryText = '';

        // Get the raw query text (without HTML tags)
        if (window.generatedQueries && window.generatedQueries[queryId]) {
            queryText = window.generatedQueries[queryId];
        } else {
            queryText = '-- SQL query will be generated here';
        }

        // Create a temporary textarea to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = queryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        // Update button text to indicate copy was successful
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        this.classList.add('copied');

        // Reset button text after 2 seconds
        setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
        }, 2000);
    });

    // Query split functionality
    const splitSelect = document.getElementById('split');
    const devDataInputs = document.getElementById('devDataInputs');

    splitSelect.addEventListener('change', function() {
        if (this.value > 1) {
            devDataInputs.classList.add('active');
        } else {
            devDataInputs.classList.remove('active');
        }

        // Update number buttons based on new split value
        updateNumberButtons();

        // Update the query part label
        updateQueryPartLabel();

        // Update the query output
        updateQueryOutput();

        updateStatus();
    });

    // Generate button functionality
    const generateButton = document.getElementById('generateButton');
    const notification = document.getElementById('notification');

    generateButton.addEventListener('click', function() {
        // Generate queries for all selected account types
        const success = generateAllQueries();

        if (success) {
            // Update the query output to show the generated query
            updateQueryOutput();

            // Show success notification
            notification.textContent = 'Queries generated successfully!';
            notification.style.background = '#2ecc71';
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    });
    // Function to generate queries for all selected account types
    function generateAllQueries() {
        // Update status first to ensure currentSettings is up to date
        updateStatus();

        // Generate queries for each selected account type
        const accountTypes = [];
        document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').forEach(cb => {
            accountTypes.push(cb.id);
            console.log(cb.id)
        });

        if (accountTypes.length === 0) {
            // Show notification if no account types selected
            notification.textContent = 'Please select at least one account type';
            notification.style.background = '#e74c3c';
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
            return false;
        }

        // Initialize the generated queries object if it doesn't exist
        if (!window.generatedQueries) {
            window.generatedQueries = {};
        }

        // Generate queries for each account type
        accountTypes.forEach(type => {
            const tierName = config.tier[type].key1;
            const queryParts = generateQuery(config, tierName);

            if (config.query.split === "1") {
                // Store the full query without splitting
                window.generatedQueries[`${type}-full`] = queryParts.full;
            } else {
                // Store each part of the query
                window.generatedQueries[`${type}-part1`] = queryParts.part1;
                window.generatedQueries[`${type}-part2`] = queryParts.part2;
                window.generatedQueries[`${type}-part3`] = queryParts.part3;
            }
        });

        return true;
    }

    // Function to handle tab state based on checkbox state
    function updateTabState(checkboxId, isChecked) {
        const tab = document.querySelector(`.tab[data-tab="${checkboxId}"]`);

        if (isChecked) {
            // Enable the tab
            tab.classList.remove('disabled');

            // If this is the first enabled tab, make it active
            if (!currentAccountType) {
                tab.classList.add('active');
                currentAccountType = checkboxId;

                // Update number buttons based on split value
                updateNumberButtons();

                resetToPart1();
                updateQueryPartLabel();
                updateQueryOutput();
            }
        } else {
            // Disable the tab
            tab.classList.add('disabled');

            // If this was the active tab, switch to another enabled tab
            if (currentAccountType === checkboxId) {
                tab.classList.remove('active');

                // Find the next enabled tab
                const enabledTabs = Array.from(document.querySelectorAll('.tab:not(.disabled)'));

                if (enabledTabs.length > 0) {
                    // Switch to the last enabled tab
                    const newTab = enabledTabs[enabledTabs.length - 1];
                    newTab.classList.add('active');
                    currentAccountType = newTab.getAttribute('data-tab');

                    // Update number buttons based on split value
                    updateNumberButtons();

                    resetToPart1();
                    updateQueryPartLabel();
                    updateQueryOutput();
                } else {
                    // No enabled tabs left
                    currentAccountType = null;

                    // Disable all number buttons
                    queryPartTabs.forEach(tab => {
                        tab.classList.add('disabled');
                    });

                    updateQueryPartLabel();
                    updateQueryOutput();
                }
            }
        }
    }

    // Status update functionality
    function updateStatus() {
        const statusContent = document.getElementById('statusContent');

        // Get Account Types
        const accountTypes = [];
        document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').forEach(cb => {
            const tierLabel = cb.nextElementSibling.textContent.trim();
            accountTypes.push(tierLabel);

            for (let key in config.tier) {
                if (config.tier[key].key1 === tierLabel) {
                    config.tier[key].checked = "Y";
                    break; // stop inner loop once matched
                }
            }                  
        });

        // Get Selected Genres
        const selectedGenres = Array.from(document.getElementById('genres').selectedOptions)
            .map(option => option.value);

        config.genre = selectedGenres[0] || "NONE";

        // Get Member Status
        const isMember = document.getElementById('memberStatus').checked;
        config.member.membership = isMember ? "Member" : "Non-Member";

        const ageFilter = document.getElementById('age').value;
        config.member.age = ageFilter;

        const isActive = document.getElementById('activeStatus').checked;
        config.member.activeStatus = isActive ? "Active" : "No";

        // Get Query Config
        const splitValue = document.getElementById('split').value;
        config.query.split = splitValue;

        const devData1 = document.getElementById('devData1').value;
        config.query.dev1 = devData1;

        const devData2 = document.getElementById('devData2').value;
        config.query.dev2 = devData2;

        const sendlistDE = document.getElementById('sendlistDE').value;
        config.query.sendlist = sendlistDE;

        const additonalField = document.getElementById('additonalField').value;
        config.query.additionalFields = additonalField;

        // Get Email & Engagement settings
        const emailOptIn = document.getElementById('emailOptIn');
        const emailOptInValue = emailOptIn.value;
        config.optIn = emailOptInValue;

        // Get Suppression settings
        const amcSuppression = document.getElementById('AMC_MasterSuppression').checked;
        config.amcMasterSupression = amcSuppression ? "Y" : "N";

        const associateSuppression = document.getElementById('Associate_Suppression').checked;
        config.associateSupression = associateSuppression ? "Y" : "N";

        const freshAddress = document.getElementById('freshAddress').checked;
        config.freshAddressExclude = freshAddress ? "Y" : "N";

        // Get Engagement settings
        const engagementFilter = document.getElementById('engagementFilter').checked;
        config.engagement = engagementFilter ? "Y" : "N";

        const complaintsFilter = document.getElementById('complaintsFilter').checked;
        config.complaintsRemoval = complaintsFilter ? "Y" : "N";

        // Build status HTML
        let statusHTML = '';

        // Account Types
        statusHTML += '<div class="status-section">';
        statusHTML += '<div class="status-label">Account Types:</div>';
        statusHTML += '<div class="status-value">' + 
            (accountTypes.length > 0 ? accountTypes.join(', ') : '<span class="status-empty">None selected</span>') + 
            '</div>';
        statusHTML += '</div>';

        // Genre Targeting
        statusHTML += '<div class="status-section">';
        statusHTML += '<div class="status-label">Genre Targeting:</div>';
        statusHTML += '<div class="status-value">' + 
            (selectedGenres.length > 0 && selectedGenres[0] !== "NONE" ? selectedGenres.slice(0, 3).join(', ') + 
            (selectedGenres.length > 3 ? '...' : '') : '<span class="status-empty">None selected</span>') + 
            '</div>';
        statusHTML += '</div>';

        // Member Status
        statusHTML += '<div class="status-section">';
        statusHTML += '<div class="status-label">Member Status:</div>';
        statusHTML += '<div class="status-value">' + 
            (isMember ? 'Member' : 'Non-Member') + 
            ', Age: ' + ageFilter + '+, Active: ' + (isActive ? 'Yes' : 'No') + 
            '</div>';
        statusHTML += '</div>';

        // Query Config
        statusHTML += '<div class="status-section">';
        statusHTML += '<div class="status-label">Query Config:</div>';
        let configText = splitValue + ' (';
        if (splitValue === '1') configText += 'Single Query';
        else if (splitValue === '2') configText += 'Split to 2 Parts';
        else if (splitValue === '3') configText += 'Split to 3 Parts';
        configText += ')';
        if (devData1) configText += ', Dev1: ' + devData1;
        if (devData2) configText += ', Dev2: ' + devData2;
        statusHTML += '<div class="status-value">' + configText + '</div>';
        statusHTML += '</div>';

        // Email & Engagement
        statusHTML += '<div class="status-section">';
        statusHTML += '<div class="status-label">Email & Engagement:</div>';
        let emailText = emailOptInValue !== '' ? emailOptIn.options[emailOptIn.selectedIndex].text : 'None';

        // Add suppression info
        const suppressionOptions = [];
        if (amcSuppression) suppressionOptions.push('AMC_MasterSuppression');
        if (associateSuppression) suppressionOptions.push('Associate Suppression');
        if (freshAddress) suppressionOptions.push('Exclude Fresh Address');
        if (suppressionOptions.length > 0) {
            emailText += ', Suppression: ' + suppressionOptions.join(', ');
        }

        // Add engagement info
        const engagementOptions = [];
        if (engagementFilter) engagementOptions.push('Open and Click 6 Months');
        if (complaintsFilter) engagementOptions.push('Complaints Removal');
        if (engagementOptions.length > 0) {
            emailText += ', Engagement: ' + engagementOptions.join(', ');
        }
        statusHTML += '<div class="status-value">' + emailText + '</div>';
        statusHTML += '</div>';

        statusContent.innerHTML = statusHTML;

        console.log(config)

    }

    // Add event listeners to account type checkboxes
    document.querySelectorAll('#accountTypes input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateTabState(this.id, this.checked);
            updateStatus();
            // Auto-generate queries on change
            if (document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').length > 0) {
                generateAllQueries();
                updateQueryOutput();
            }
        });
    });

    // Add event listeners to all other form elements
    document.querySelectorAll('input[type="checkbox"]:not(#accountTypes input[type="checkbox"]), select, input[type="text"]').forEach(element => {
        element.addEventListener('change', function() {
            updateStatus();
            // Auto-generate queries on change
            if (document.querySelectorAll('#accountTypes input[type="checkbox"]:checked').length > 0) {
                generateAllQueries();
                updateQueryOutput();
            }
        });
    });

    // Initial status update - moved after event listeners are attached
    updateStatus();
});