// ===== GLOBAL STATE =====
let globe;
let countryData = [];
let allLanguages = [];

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initGlobe();
    setupEventListeners();
    fetchLanguageData();

    // Trigger animation after a delay
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 2000);
});

// ===== GLOBE INITIALIZATION =====
function initGlobe() {
    globe = Globe()
        (document.getElementById('globeViz'))
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('#1a73e8')
        .atmosphereAltitude(0.15)
        // Points for countries
        .pointsData([])
        .pointColor(d => d.color)
        .pointAltitude(0.01)
        .pointRadius(0.2)
        .pointsMerge(true)
        .pointsTransitionDuration(1000)
        .pointLabel(d => createTooltip(d))
        // Polygons for country borders
        .polygonsData([])
        .polygonCapColor(() => 'rgba(0, 0, 0, 0)')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.15)')
        .polygonAltitude(0.001)
        .polygonLabel(d => createCountryCard(d.properties))
        .onPolygonHover(hoverPolygon => {
            globe.polygonStrokeColor(d =>
                d === hoverPolygon ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'
            );
        });

    // Camera and controls
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = true;
    controls.minDistance = 200;
    controls.maxDistance = 600;

    // Initial camera position
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

    // Load country polygons
    loadCountryPolygons();
}

// ===== DATA FETCHING =====
async function fetchLanguageData() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const countries = await response.json();

        countryData = processCountryData(countries);
        globe.pointsData(countryData);
        updateStats();
    } catch (error) {
        console.error('Failed to fetch country data:', error);
        // Fallback to mock data
        countryData = generateMockData();
        globe.pointsData(countryData);
        updateStats();
    }
}

// ===== DATA PROCESSING =====
function processCountryData(countries) {
    const processed = [];
    const languageSet = new Set();

    countries.forEach(country => {
        if (!country.latlng || country.latlng.length !== 2) return;

        const languages = country.languages
            ? Object.values(country.languages)
            : [];

        languages.forEach(lang => languageSet.add(lang));

        // Extract currencies
        const currencies = country.currencies
            ? Object.values(country.currencies).map(c => c.name).join(', ')
            : null;

        // Extract timezones
        const timezones = country.timezones
            ? country.timezones.join(', ')
            : null;

        const point = {
            lat: country.latlng[0],
            lng: country.latlng[1],
            name: country.name.common,
            officialName: country.name.official,
            capital: country.capital ? country.capital[0] : 'N/A',
            region: country.region || 'Unknown',
            subregion: country.subregion || 'Unknown',
            population: country.population || 0,
            languages: languages,
            flag: country.flag || '🏳️',
            currencies: currencies,
            timezones: timezones,
            color: getColorByLanguageCount(languages.length)
        };

        processed.push(point);
    });

    allLanguages = Array.from(languageSet);
    return processed;
}

function getColorByLanguageCount(count) {
    // Google blue gradient based on language diversity
    if (count === 0) return '#9aa0a6';
    if (count === 1) return '#e8eaed';
    if (count === 2) return '#aecbfa';
    if (count <= 4) return '#8ab4f8';
    if (count <= 7) return '#669df6';
    if (count <= 12) return '#4285f4';
    return '#1a73e8';
}

function generateMockData() {
    const mock = [];
    for (let i = 0; i < 195; i++) {
        mock.push({
            lat: (Math.random() - 0.5) * 150,
            lng: (Math.random() - 0.5) * 360,
            name: `Country ${i}`,
            capital: 'Capital',
            region: 'Region',
            population: Math.floor(Math.random() * 100000000),
            languages: ['Language A', 'Language B'],
            flag: '🌍',
            color: getColorByLanguageCount(Math.floor(Math.random() * 15))
        });
    }
    return mock;
}

// ===== TOOLTIP =====
function createTooltip(d) {
    const languages = d.languages.length > 0 ? d.languages.join(', ') : 'No data';
    const population = d.population.toLocaleString();

    // Build comprehensive info
    let info = `
        <div style="
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            padding: 16px 20px;
            border-radius: 12px;
            border: 1px solid rgba(26, 115, 232, 0.3);
            max-width: 350px;
            font-family: 'Google Sans', 'Roboto', sans-serif;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        ">
            <div style="
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 12px;
                color: #4a9eff;
            ">${d.flag} ${d.name}</div>
            
            <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px;">
                ${d.officialName}
            </div>
    `;

    // Capital
    if (d.capital && d.capital !== 'N/A') {
        info += `
            <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
                <strong style="color: #fff;">Capital:</strong> ${d.capital}
            </div>
        `;
    }

    // Region and Subregion
    info += `
        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
            <strong style="color: #fff;">Region:</strong> ${d.region}${d.subregion && d.subregion !== 'Unknown' ? ` (${d.subregion})` : ''}
        </div>
    `;

    // Population
    info += `
        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;">
            <strong style="color: #fff;">Population:</strong> ${population}
        </div>
    `;

    // Languages
    info += `
        <div style="font-size: 12px; font-weight: 500; color: #fff; margin-bottom: 6px;">
            Languages (${d.languages.length}):
        </div>
        <div style="font-size: 13px; color: #ffd966; line-height: 1.7; margin-bottom: 12px;">
            ${languages}
        </div>
    `;

    // Additional info if available
    if (d.currencies) {
        info += `
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">
                <strong>Currency:</strong> ${d.currencies}
            </div>
        `;
    }

    if (d.timezones) {
        info += `
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">
                <strong>Timezones:</strong> ${d.timezones}
            </div>
        `;
    }

    info += `</div>`;
    return info;
}

// ===== STATS UPDATE =====
function updateStats() {
    document.getElementById('langCount').textContent = allLanguages.length.toLocaleString();

    const totalPop = countryData.reduce((sum, c) => sum + c.population, 0);
    const popInBillions = (totalPop / 1000000000).toFixed(1);
    document.getElementById('popCount').textContent = `${popInBillions}B`;

    document.getElementById('countryCount').textContent = countryData.length;
    document.getElementById('scriptCount').textContent = '159';
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);

    // Filter pills
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            handleFilterClick(filter, e.currentTarget);
        });
    });

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.getAttribute('href').substring(1);
            openModal(target + 'Modal');
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Modal backdrop clicks
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pill') && !e.target.closest('.dropdown-menu')) {
            closeDropdown();
        }
    });
}

// ===== SEARCH =====
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        globe.pointsData(countryData);
        return;
    }

    const filtered = countryData.filter(country => {
        return country.name.toLowerCase().includes(query) ||
            country.region.toLowerCase().includes(query) ||
            country.languages.some(lang => lang.toLowerCase().includes(query));
    });

    globe.pointsData(filtered);
}

// ===== FILTERS =====
function handleFilterClick(filterType, button) {
    const dropdown = document.getElementById('dropdown');
    const rect = button.getBoundingClientRect();

    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.left = `${rect.left}px`;

    populateDropdown(filterType);
    dropdown.classList.add('active');
}

function populateDropdown(filterType) {
    const dropdown = document.getElementById('dropdown');
    dropdown.innerHTML = '';

    let options = [];

    switch (filterType) {
        case 'region':
            options = ['All Regions', ...new Set(countryData.map(c => c.region))];
            break;
        case 'country':
            options = ['All Countries', ...countryData.map(c => c.name).sort()].slice(0, 50);
            break;
        case 'language':
            options = ['All Languages', ...allLanguages.sort()].slice(0, 50);
            break;
        default:
            options = ['Coming soon...'];
    }

    options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = opt;
        item.addEventListener('click', () => {
            handleFilterSelect(filterType, opt);
            closeDropdown();
        });
        dropdown.appendChild(item);
    });
}

function handleFilterSelect(filterType, value) {
    if (value.startsWith('All') || value === 'Coming soon...') {
        globe.pointsData(countryData);
        return;
    }

    let filtered = [];

    switch (filterType) {
        case 'region':
            filtered = countryData.filter(c => c.region === value);
            break;
        case 'country':
            filtered = countryData.filter(c => c.name === value);
            break;
        case 'language':
            filtered = countryData.filter(c => c.languages.includes(value));
            break;
    }

    globe.pointsData(filtered);
}

function closeDropdown() {
    document.getElementById('dropdown').classList.remove('active');
}

// ===== MODALS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}
