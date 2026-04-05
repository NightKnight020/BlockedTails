// Configuration
const CONFIG = {
    MAPBOX_TOKEN: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NHFsZzA2YWgycXA4N2pmbDZmangifQ.saX5YWBfGCM8rHMtGT3fTg',
    ADSB_API_KEY: '0b616e6bb7msh7bca2a9c0b72d5ap18774bjsna04e271b0aca',
    ADSB_API_HOST: 'adsbexchange-com1.p.rapidapi.com',
    BLOCKED_TAILS: ['N123AB', 'N456CD', 'N789EF', 'N280PH'], // Example blocked tails
    UPDATE_INTERVAL: 30000, // 30 seconds
    DEFAULT_VIEW: {
        center: [-95.7129, 37.0902], // Center of USA
        zoom: 4
    }
};

// Global state
let map = null;
let aircraftMarkers = [];
let aircraftData = [];
let blockedAircraft = [];
let foundAircraft = null;
let updateInterval = null;

// Initialize Mapbox
function initMap() {
    mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: CONFIG.DEFAULT_VIEW.center,
        zoom: CONFIG.DEFAULT_VIEW.zoom
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());
    
    // Add scale control
    map.addControl(new mapboxgl.ScaleControl());
    
    // Handle map load
    map.on('load', () => {
        console.log('Map loaded successfully');
        loadAircraftData();
        startAutoRefresh();
    });
}

// Fetch aircraft data from ADSB Exchange API
async function fetchAircraftData() {
    showLoading(true);
    updateStatus('Fetching aircraft data...');
    
    try {
        const response = await fetch(`https://${CONFIG.ADSB_API_HOST}/v2/lat/40/lon/-100/dist/1500/`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': CONFIG.ADSB_API_KEY,
                'x-rapidapi-host': CONFIG.ADSB_API_HOST
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Aircraft data received:', data);
        
        // Process aircraft data
        processAircraftData(data.ac || data.aircraft || []);
        updateStatus(`Loaded ${aircraftData.length} aircraft`);
        
    } catch (error) {
        console.error('Error fetching aircraft data:', error);
        updateStatus(`Error: ${error.message}`);
        
        // Fallback to mock data for demo
        useMockData();
    } finally {
        showLoading(false);
    }
}

// Process and display aircraft data
function processAircraftData(aircraft) {
    // Clear existing markers
    clearAircraftMarkers();
    
    // Reset data
    aircraftData = [];
    blockedAircraft = [];
    foundAircraft = null;
    
    // Process each aircraft
    aircraft.forEach(ac => {
        if (!ac.lat || !ac.lon) return;
        
        const tailNumber = ac.flight?.trim() || ac.hex || 'UNKNOWN';
        const isBlocked = CONFIG.BLOCKED_TAILS.includes(tailNumber);
        const isSearched = tailNumber === document.getElementById('searchInput').value.trim().toUpperCase();
        
        // Add to data arrays
        const aircraftObj = {
            ...ac,
            tailNumber,
            isBlocked,
            isSearched
        };
        
        aircraftData.push(aircraftObj);
        
        if (isBlocked) {
            blockedAircraft.push(aircraftObj);
        }
        
        if (isSearched) {
            foundAircraft = aircraftObj;
        }
        
        // Create map marker
        createAircraftMarker(aircraftObj);
    });
    
    // Update UI
    updateAircraftList();
    updateStats();
    
    // Focus on searched aircraft if found
    if (foundAircraft) {
        focusOnAircraft(foundAircraft);
    }
}

// Create aircraft marker on map
function createAircraftMarker(aircraft) {
    const color = aircraft.isBlocked ? '#ff4757' : 
                  aircraft.isSearched ? '#2ed573' : '#667eea';
    
    const el = document.createElement('div');
    el.className = 'aircraft-marker';
    el.style.width = '12px';
    el.style.height = '12px';
    el.style.backgroundColor = color;
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
            <div style="padding: 8px; font-family: sans-serif;">
                <strong>${aircraft.tailNumber}</strong><br>
                ${aircraft.type || 'Unknown type'}<br>
                Alt: ${aircraft.alt_baro || aircraft.alt_geom || 'N/A'} ft<br>
                Speed: ${aircraft.gs || aircraft.tas || 'N/A'} kts<br>
                ${aircraft.isBlocked ? '<span style="color: #ff4757;">🚫 BLOCKED</span>' : ''}
                ${aircraft.isSearched ? '<span style="color: #2ed573;">✅ FOUND</span>' : ''}
            </div>
        `);
    
    // Add marker to map
    const marker = new mapboxgl.Marker(el)
        .setLngLat([aircraft.lon, aircraft.lat])
        .setPopup(popup)
        .addTo(map);
    
    aircraftMarkers.push(marker);
}

// Clear all aircraft markers
function clearAircraftMarkers() {
    aircraftMarkers.forEach(marker => marker.remove());
    aircraftMarkers = [];
}

// Update aircraft list in sidebar
function updateAircraftList() {
    const list = document.getElementById('aircraftList');
    list.innerHTML = '';
    
    // Show blocked aircraft first
    blockedAircraft.forEach(ac => {
        list.appendChild(createAircraftListItem(ac));
    });
    
    // Then show searched aircraft (if not already in blocked)
    if (foundAircraft && !blockedAircraft.includes(foundAircraft)) {
        list.appendChild(createAircraftListItem(foundAircraft));
    }
    
    // Then show up to 10 other aircraft
    const otherAircraft = aircraftData
        .filter(ac => !ac.isBlocked && !ac.isSearched)
        .slice(0, 10);
    
    otherAircraft.forEach(ac => {
        list.appendChild(createAircraftListItem(ac));
    });
    
    // Show message if no aircraft
    if (aircraftData.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'aircraft-item';
        emptyMsg.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No aircraft data available</div>';
        list.appendChild(emptyMsg);
    }
}

// Create aircraft list item
function createAircraftListItem(aircraft) {
    const item = document.createElement('div');
    item.className = 'aircraft-item';
    
    if (aircraft.isBlocked) {
        item.classList.add('blocked');
    }
    if (aircraft.isSearched) {
        item.classList.add('found');
    }
    
    const alt = aircraft.alt_baro || aircraft.alt_geom || 'N/A';
    const speed = aircraft.gs || aircraft.tas || 'N/A';
    const heading = aircraft.track || aircraft.mag_heading || 'N/A';
    
    item.innerHTML = `
        <div class="aircraft-header">
            <div class="tail-number">${aircraft.tailNumber}</div>
            <div class="aircraft-type">${aircraft.type || 'Unknown'}</div>
        </div>
        <div class="aircraft-info">
            <div>Alt: ${alt} ft</div>
            <div>Speed: ${speed} kts</div>
            <div>HDG: ${heading}°</div>
        </div>
    `;
    
    // Click to focus on map
    item.addEventListener('click', () => {
        focusOnAircraft(aircraft);
    });
    
    return item;
}

// Focus map on specific aircraft
function focusOnAircraft(aircraft) {
    map.flyTo({
        center: [aircraft.lon, aircraft.lat],
        zoom: 10,
        duration: 1500
    });
    
    // Open popup if available
    const marker = aircraftMarkers.find(m => 
        m.getLngLat().lng === aircraft.lon && 
        m.getLngLat().lat === aircraft.lat
    );
    
    if (marker && marker.getPopup()) {
        marker.togglePopup();
    }
}

// Update status display
function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

// Update statistics display
function updateStats() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    document.getElementById('stats').innerHTML = `
        Aircraft: ${aircraftData.length} | 
        Blocked: ${blockedAircraft.length} | 
        Last Update: ${timeStr}
    `;
}

// Show/hide loading indicator
function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

// Start auto-refresh interval
function startAutoRefresh() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(loadAircraftData, CONFIG.UPDATE_INTERVAL);
}

// Load aircraft data (with error handling)
function loadAircraftData() {
    fetchAircraftData().catch(error => {
        console.error('Failed to load aircraft data:', error);
        updateStatus('Failed to load data. Retrying...');
    });
}

// Use mock data for demo purposes
function useMockData() {
    console.log('Using mock data for demonstration');
    
    const mockAircraft = [
        {
            lat: 40.7128,
            lon: -74.0060,
            flight: 'N280PH',
            type: 'B737',
            alt_baro: 35000,
            gs: 450,
            track: 270
        },
        {
            lat: 34.0522,
            lon: -118.2437,
            flight: 'N123AB',
            type: 'A320',
            alt_baro: 28000,
            gs: 420,
            track: 180
        },
        {
            lat: 41.8781,
            lon: -87.6298,
            flight: 'UA456',
            type: 'B787',
            alt_baro: 39000,
            gs: 480,
            track: 90
        },
        {
            lat: 29.7604,
            lon: -95.3698,
            flight: 'N456CD',
            type: 'CRJ9',
            alt_baro: 22000,
            gs: 380,
            track: 320
        },
        {
            lat: 33.4484,
            lon: -112.0740,
            flight: 'AA789',
            type: 'A321',
            alt_baro: 31000,
            gs: 440,
            track: 45
        }
    ];
    
    processAircraftData(mockAircraft);
    updateStatus('Using demo data (API unavailable)');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    initMap();
    
    // Search button
    document.getElementById('searchBtn').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value.trim().toUpperCase();
        if (searchTerm) {
            updateStatus(`Searching for ${searchTerm}...`);
            loadAircraftData();
        }
    });
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadAircraftData);
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('searchBtn').click();
        }
    });
    
    // Map controls
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        map.zoomIn();
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        map.zoomOut();
    });
    
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        map.flyTo({
            center: CONFIG.DEFAULT_VIEW.center,
            zoom: CONFIG.DEFAULT_VIEW.zoom,
            duration: 1000
        });
    });
    
    // Initial status
    updateStatus('Initializing application...');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadAircraftData();
    }
});

// Export for debugging
window.app = {
    loadAircraftData,
    useMockData,
    CONFIG
};


