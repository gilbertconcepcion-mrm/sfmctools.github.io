// Campaign Type Dropdown Handler
document.addEventListener('DOMContentLoaded', function() {
    const campaignTypeSelect = document.getElementById('campaignType');
    const genreTab = document.querySelector('.dashboard-tab[data-tab="genreTargeting"]');

    // --- Redirect logic based on selected campaign type ---
    function updateCampaignType() {
        const selectedType = campaignTypeSelect.value;

        switch (selectedType) {
            case 'sendlist':
                window.location.href = 'sendlist.html';
                break;
            case 'transactional':
                window.location.href = 'transactional.html';
                break;
            case 'genre':
                window.location.href = 'index.html';
                break;
            default:
                break;
        }
    }

    // --- Detect current page and adjust UI accordingly ---
    const currentPage = window.location.pathname;

    if (genreTab) {
        if (currentPage.includes('sendlist.html') || currentPage.includes('transactional.html')) {
            // Hide genre tab on sendlist & transactional pages
            genreTab.style.display = 'none';
        } else {
            // Show genre tab on index.html or other pages
            genreTab.style.display = 'flex';
        }
    }

    // --- Preselect campaign type based on current page ---
    if (currentPage.includes('sendlist.html')) {
        campaignTypeSelect.value = 'sendlist';
    } else if (currentPage.includes('transactional.html')) {
        campaignTypeSelect.value = 'transactional';
    } else {
        campaignTypeSelect.value = 'genre';
    }

    // --- Listen for dropdown changes ---
    campaignTypeSelect.addEventListener('change', updateCampaignType);
});
