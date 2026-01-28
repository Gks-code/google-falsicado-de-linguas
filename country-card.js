// Add after the initGlobe function

// ===== LOAD COUNTRY POLYGONS =====
async function loadCountryPolygons() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const geojson = await response.json();

        // Enrich with country data
        geojson.features.forEach(feature => {
            const countryName = feature.properties.ADMIN;
            const matchingCountry = countryData.find(c =>
                c.name === countryName || c.officialName === countryName
            );

            if (matchingCountry) {
                feature.properties.countryData = matchingCountry;
            }
        });

        globe.polygonsData(geojson.features);
    } catch (error) {
        console.error('Failed to load country polygons:', error);
    }
}

// ===== CREATE COUNTRY CARD =====
function createCountryCard(properties) {
    const data = properties.countryData;
    if (!data) return '';

    const languages = data.languages.length > 0 ? data.languages : ['No data'];
    const population = data.population.toLocaleString();

    let card = `
        <div style="
            background: linear-gradient(135deg, rgba(10, 10, 10, 0.98), rgba(26, 26, 26, 0.98));
            backdrop-filter: blur(20px);
            padding: 24px;
            border-radius: 16px;
            border: 2px solid rgba(26, 115, 232, 0.5);
            max-width: 400px;
            min-width: 320px;
            font-family: 'Google Sans', 'Roboto', sans-serif;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
        ">
            <!-- Header -->
            <div style="
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 8px;
                color: #4a9eff;
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                <span style="font-size: 32px;">${data.flag}</span>
                <span>${data.name}</span>
            </div>
            
            <div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px; font-style: italic;">
                ${data.officialName}
            </div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-bottom: 16px;">
                <!-- Basic Info Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Capital</div>
                        <div style="font-size: 14px; color: #fff; margin-top: 4px;">${data.capital}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Population</div>
                        <div style="font-size: 14px; color: #fff; margin-top: 4px;">${population}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Region</div>
                        <div style="font-size: 14px; color: #fff; margin-top: 4px;">${data.region}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px;">Subregion</div>
                        <div style="font-size: 14px; color: #fff; margin-top: 4px;">${data.subregion}</div>
                    </div>
                </div>
            </div>
            
            <!-- Languages Section -->
            <div style="
                background: rgba(26, 115, 232, 0.1);
                border: 1px solid rgba(26, 115, 232, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
            ">
                <div style="
                    font-size: 13px;
                    font-weight: 500;
                    color: #4a9eff;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2z"/>
                        <path d="M8 4v4l3 2"/>
                    </svg>
                    Languages Spoken (${data.languages.length})
                </div>
                <div style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                ">
    `;

    // Language pills
    languages.forEach(lang => {
        card += `
            <span style="
                background: rgba(255, 217, 102, 0.15);
                color: #ffd966;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid rgba(255, 217, 102, 0.3);
            ">${lang}</span>
        `;
    });

    card += `
                </div>
            </div>
    `;

    // States/Provinces Section (if available)
    if (data.states && data.states.length > 0) {
        card += `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                max-height: 200px;
                overflow-y: auto;
            ">
                <div style="
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 12px;
                ">
                    Administrative Divisions (${data.states.length})
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
        `;

        data.states.forEach(state => {
            card += `
                <div style="
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    border-left: 3px solid #4a9eff;
                ">
                    <div style="font-size: 13px; color: #fff; font-weight: 500;">${state.name}</div>
                    ${state.languages ? `
                        <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px;">
                            Languages: ${state.languages.join(', ')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        card += `
                </div>
            </div>
        `;
    }

    // Additional Info
    if (data.currencies || data.timezones) {
        card += `
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 12px;">
        `;

        if (data.currencies) {
            card += `
                <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">
                    <strong style="color: rgba(255,255,255,0.8);">Currency:</strong> ${data.currencies}
                </div>
            `;
        }

        if (data.timezones) {
            card += `
                <div style="font-size: 12px; color: rgba(255,255,255,0.6);">
                    <strong style="color: rgba(255,255,255,0.8);">Timezones:</strong> ${data.timezones}
                </div>
            `;
        }

        card += `</div>`;
    }

    card += `</div>`;
    return card;
}
