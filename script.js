document.addEventListener('DOMContentLoaded', () => {
    // 1. PAGE NAVIGATION LOGIC
    const navItems = document.querySelectorAll('.nav-item');
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const pageViews = document.querySelectorAll('.page-view');

    function switchPage(targetId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        pageViews.forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden'); 
        });

        const targetPage = document.getElementById(targetId);
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active-page');
    }

    navItems.forEach(item => item.addEventListener('click', (e) => switchPage(e.currentTarget.getAttribute('data-target'))));
    navTriggers.forEach(trigger => trigger.addEventListener('click', (e) => switchPage(e.currentTarget.getAttribute('data-target'))));

    // 2. HARDWARE DATABASE LOGIC
    const buildContainer = document.getElementById('builds-container');
    const budgetFilter = document.getElementById('budget-filter');
    let hardwareData = [];

    const fallbackData = [
        { name: "Coding & Development Build", cpu: "Intel i5-13400", gpu: "Integrated UHD 730", ram: "32GB DDR5 5200MHz", storage: "1TB Gen4 NVMe", price: "₹55,000", cat: "entry" },
        { name: "Solid 1080p Streamer", cpu: "AMD Ryzen 5 5600", gpu: "NVIDIA RTX 3060 12GB", ram: "16GB DDR4 3200MHz", storage: "1TB Gen3 NVMe", price: "₹68,000", cat: "entry" },
        { name: "1440p Sweet Spot", cpu: "AMD Ryzen 5 7600", gpu: "AMD Radeon RX 7700 XT", ram: "32GB DDR5 6000MHz", storage: "1TB Gen4 NVMe", price: "₹95,000", cat: "mid" },
        { name: "Heavy Editing Workstation", cpu: "Intel i7-13700K", gpu: "NVIDIA RTX 4070 SUPER", ram: "64GB DDR5 6000MHz", storage: "2TB Gen4 NVMe", price: "₹1,45,000", cat: "high" }
    ];

    function renderBuilds(data) {
        buildContainer.innerHTML = '';
        if (data.length === 0) {
            buildContainer.innerHTML = '<div class="empty-state">No builds found for this category.</div>';
            return;
        }

        data.forEach(build => {
            const card = document.createElement('div');
            card.className = 'db-card';
            card.innerHTML = `
                <div class="db-card-head">
                    <h4>${build.name}</h4>
                    <span class="price">${build.price}</span>
                </div>
                <div class="db-card-body">
                    <div><i class="ph ph-cpu"></i> ${build.cpu}</div>
                    <div><i class="ph ph-graphics-card"></i> ${build.gpu}</div>
                    <div><i class="ph ph-memory"></i> ${build.ram}</div>
                    <div><i class="ph ph-hard-drives"></i> ${build.storage}</div>
                </div>
            `;
            buildContainer.appendChild(card);
        });
    }

    fetch('hardware.json')
        .then(response => {
            if (!response.ok) throw new Error("Local Fetch Blocked.");
            return response.json();
        })
        .then(data => {
            hardwareData = data;
            renderBuilds(hardwareData);
        })
        .catch(error => {
            console.warn("JSON fetch failed. Loading backup data to keep filters working.");
            hardwareData = fallbackData;
            renderBuilds(hardwareData);
        });

    budgetFilter.addEventListener('change', (e) => {
        const filterVal = e.target.value;
        if (filterVal === 'all') {
            renderBuilds(hardwareData);
        } else {
            const filtered = hardwareData.filter(b => b.cat === filterVal);
            renderBuilds(filtered);
        }
    });

    // 3. COMPATIBILITY DIAGNOSTICS
    const checkBtn = document.getElementById('run-diag-btn');
    const cpuSelect = document.getElementById('cpu-select');
    const moboSelect = document.getElementById('mobo-select');
    const diagOutput = document.getElementById('diag-output');

    checkBtn.addEventListener('click', () => {
        diagOutput.classList.remove('hidden', 'success', 'error');
        const cpu = cpuSelect.value;
        const mobo = moboSelect.value;

        if (cpu === 'none' || mobo === 'none') {
            diagOutput.classList.add('error');
            diagOutput.textContent = 'Error: Please select both a processor and a motherboard.';
            return;
        }

        if (cpu === mobo) {
            diagOutput.classList.add('success');
            diagOutput.textContent = 'Compatibility Confirmed: Sockets match perfectly.';
        } else {
            diagOutput.classList.add('error');
            diagOutput.textContent = 'Hardware Conflict: The selected CPU will not fit the Motherboard.';
        }
    });

    // 4. API FETCHING (WITH MORE GAMES AND INR CONVERSION)
    const fetchApiBtn = document.getElementById('fetch-api-btn');
    const dealsContainer = document.getElementById('deals-container');
    const USD_TO_INR_RATE = 83.5;

    const fallbackDeals = [
        { title: "Cyberpunk 2077", normalPrice: "59.99", salePrice: "29.99", savings: "50" },
        { title: "Red Dead Redemption 2", normalPrice: "59.99", salePrice: "19.79", savings: "67" },
        { title: "Elden Ring", normalPrice: "59.99", salePrice: "39.99", savings: "33" },
        { title: "The Witcher 3: Wild Hunt", normalPrice: "39.99", salePrice: "9.99", savings: "75" },
        { title: "Grand Theft Auto V", normalPrice: "29.99", salePrice: "14.99", savings: "50" },
        { title: "DOOM Eternal", normalPrice: "39.99", salePrice: "7.99", savings: "80" }
    ];

    function renderDealCards(dealArray) {
        dealsContainer.innerHTML = '';
        dealArray.forEach(deal => {
            const normalPriceINR = Math.round(parseFloat(deal.normalPrice) * USD_TO_INR_RATE).toLocaleString('en-IN');
            const salePriceINR = Math.round(parseFloat(deal.salePrice) * USD_TO_INR_RATE).toLocaleString('en-IN');

            const card = document.createElement('div');
            card.className = 'db-card deal-item';
            card.innerHTML = `
                <div class="deal-info">
                    <h4>${deal.title.length > 25 ? deal.title.substring(0, 25) + '...' : deal.title}</h4>
                    <div class="deal-prices">
                        <span class="strike">₹${normalPriceINR}</span>
                        <span class="sale">₹${salePriceINR}</span>
                    </div>
                </div>
                <div class="save-badge">-${Math.round(deal.savings)}%</div>
            `;
            dealsContainer.appendChild(card);
        });
    }

    fetchApiBtn.addEventListener('click', () => {
        dealsContainer.innerHTML = '<div class="empty-state">Pinging API and converting to INR...</div>';
        
        fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&pageSize=12')
            .then(response => {
                if (!response.ok) throw new Error("API Offline");
                return response.json();
            })
            .then(data => {
                renderDealCards(data);
            })
            .catch(error => {
                console.warn("Live API failed. Loading offline backup games.");
                renderDealCards(fallbackDeals);
            });
    });
});