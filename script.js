// Dummy user credentials for demo
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Region-specific base values
const REGION_DATA = {
    bhubaneswar: {
        waterUsageBase: 250,
        purityBase: 96,
        ironBase: 0.3,
        calciumBase: 1.2,
        sulphurBase: 0.5,
        phBase: 7.2
    },
    cuttack: {
        waterUsageBase: 220,
        purityBase: 94,
        ironBase: 0.4,
        calciumBase: 1.4,
        sulphurBase: 0.6,
        phBase: 7.0
    },
    puri: {
        waterUsageBase: 280,
        purityBase: 98,
        ironBase: 0.2,
        calciumBase: 1.0,
        sulphurBase: 0.4,
        phBase: 7.4
    }
};

// Initialize water usage data
let waterUsageData = {
    labels: [],
    values: []
};

// Initialize Chart
let waterUsageChart;
let metricsInterval;
let currentRegion = 'bhubaneswar';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const regionSelect = document.getElementById('regionSelect');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
regionSelect.addEventListener('change', handleRegionChange);

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        showDashboard();
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    clearInterval(metricsInterval);
    showLogin();
}

// Handle Region Change
function handleRegionChange(e) {
    currentRegion = e.target.value;
    // Reset chart data when region changes
    waterUsageData.labels = [];
    waterUsageData.values = [];
    if (waterUsageChart) {
        waterUsageChart.destroy();
    }
    initializeChart();
    updateMetrics(); // Immediate update for new region
}

// Initialize Chart
function initializeChart() {
    const ctx = document.getElementById('waterUsageChart').getContext('2d');
    waterUsageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: waterUsageData.labels,
            datasets: [{
                label: 'Water Usage (L)',
                data: waterUsageData.values,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                barThickness: 'flex',
                maxBarThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liters'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

// Update water usage data
function updateWaterUsageData(newValue) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    waterUsageData.labels.push(timeString);
    waterUsageData.values.push(newValue);
    
    // Keep only last 10 data points
    if (waterUsageData.labels.length > 10) {
        waterUsageData.labels.shift();
        waterUsageData.values.shift();
    }
    
    if (waterUsageChart) {
        waterUsageChart.update();
    }
}

// Generate random fluctuation around base value
function getFluctuatedValue(baseValue, fluctuationPercentage) {
    const fluctuation = baseValue * (fluctuationPercentage / 100);
    return baseValue + (Math.random() * 2 - 1) * fluctuation;
}

// Update metrics
function updateMetrics() {
    const regionBaseValues = REGION_DATA[currentRegion];
    
    // Random fluctuations in water metrics
    const waterUsage = Math.floor(getFluctuatedValue(regionBaseValues.waterUsageBase, 20));
    const purity = getFluctuatedValue(regionBaseValues.purityBase, 4).toFixed(1);
    const iron = getFluctuatedValue(regionBaseValues.ironBase, 20).toFixed(2);
    const calcium = getFluctuatedValue(regionBaseValues.calciumBase, 15).toFixed(1);
    const sulphur = getFluctuatedValue(regionBaseValues.sulphurBase, 15).toFixed(1);
    const ph = getFluctuatedValue(regionBaseValues.phBase, 5).toFixed(1);

    // Update the values in the dashboard
    const metrics = {
        'Water Usage': `${waterUsage} L`,
        'Purity': `${purity}%`,
        'Iron Content': `${iron}%`,
        'Calcium Content': `${calcium}%`,
        'Sulphur Content': `${sulphur}%`,
        'pH Level': ph
    };

    // Update each metric
    Object.entries(metrics).forEach(([key, value]) => {
        const element = document.querySelector(`[dt="${key}"] + dd .text-2xl`);
        if (element) {
            element.textContent = value;
        }
    });

    // Update chart
    updateWaterUsageData(waterUsage);
}

// Show Dashboard
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userNameSpan.textContent = localStorage.getItem('username') || 'User';
    
    // Initialize chart if not already initialized
    if (!waterUsageChart) {
        initializeChart();
    }

    // Start updating metrics
    updateMetrics(); // Initial update
    metricsInterval = setInterval(updateMetrics, 5000); // Update every 5 seconds
}

// Show Login
function showLogin() {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
    
    // Clear the chart data
    waterUsageData.labels = [];
    waterUsageData.values = [];
    if (waterUsageChart) {
        waterUsageChart.destroy();
        waterUsageChart = null;
    }
}

// Initialize the app
checkLoginStatus();
