let fullDatabase = { cars: {}, bikes: {} };

const typeSelect = document.getElementById('vehicle-type');
const brandSelect = document.getElementById('car-brand');
const modelSelect = document.getElementById('car-model');
const yearSelect = document.getElementById('car-year');
const checkButton = document.getElementById('check-button');
const resultsContainer = document.getElementById('results-container');
const placeholderState = document.getElementById('placeholder-state');
const resultMessage = document.getElementById('result-message');

function populateBrands() {
    if (!brandSelect) return;
    const vehicleType = typeSelect.value; // 'cars' or 'bikes'
    const db = fullDatabase[vehicleType] || {};
    
    brandSelect.innerHTML = '<option value="">Select Manufacturer</option>';
    const brands = Object.keys(db).sort();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
    
    // Reset models and years
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    modelSelect.disabled = true;
    yearSelect.innerHTML = '<option value="">Year</option>';
    yearSelect.disabled = true;
    checkButton.disabled = true;
}

function updateModels() {
    const vehicleType = typeSelect.value;
    const selectedBrand = brandSelect.value;
    
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    yearSelect.innerHTML = '<option value="">Year</option>';
    modelSelect.disabled = true;
    yearSelect.disabled = true;
    checkButton.disabled = true;

    const db = fullDatabase[vehicleType] || {};
    if (db[selectedBrand]) {
        modelSelect.disabled = false;
        const models = [...new Set(db[selectedBrand].map(v => v.model))].sort();
        models.forEach(modelName => {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        });
    }
}

function updateYears() {
    yearSelect.innerHTML = '<option value="">Year</option>';
    yearSelect.disabled = true;
    checkButton.disabled = true;

    const vehicleType = typeSelect.value;
    const selectedBrand = brandSelect.value;
    const selectedModel = modelSelect.value;
    const db = fullDatabase[vehicleType] || {};

    if (selectedModel) {
        const vehicleData = db[selectedBrand]?.find(v => v.model === selectedModel);
        if (vehicleData && vehicleData.productionStart) {
            yearSelect.disabled = false;
            const startYear = vehicleData.productionStart;
            const endYear = new Date().getFullYear();
            for (let year = endYear; year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        }
    }
}

function checkCompliance() {
    const vehicleType = typeSelect.value;
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const year = parseInt(yearSelect.value, 10);
    
    const db = fullDatabase[vehicleType] || {};
    const vehicleData = db[brand]?.find(v => v.model === model);

    placeholderState.style.display = 'none';
    
    if (!vehicleData) {
        showError("Data not found for this model.");
        return;
    }

    let isCompliant = true;
    if (vehicleData.compliantYear && year < vehicleData.compliantYear) {
        isCompliant = false;
    }

    const maxEthanol = vehicleData.maxEthanol; // e.g. E20 or E85
    let title = "";
    let bgColor = "";
    let icon = "";
    let warningHtml = "";

    if (isCompliant) {
        title = `Vehicle is ${maxEthanol} Compliant`;
        bgColor = "bg-secondary"; // Green
        icon = "check_circle";
        if (maxEthanol === "E85") {
            warningHtml = `
            <div class="mt-4 p-4 bg-orange-100 border border-orange-300 text-orange-900 rounded-lg flex gap-3">
                <span class="material-symbols-outlined text-orange-600">warning</span>
                <div>
                    <strong>Flex-Fuel Vehicle Detected!</strong> 
                    <p>This vehicle can safely run on E85. However, NEVER put E85 in a standard E20 vehicle. E85 is highly corrosive to non-Flex-Fuel engines.</p>
                </div>
            </div>`;
        }
    } else {
        title = `Not ${maxEthanol} Compliant`;
        bgColor = "bg-error"; // Red
        icon = "cancel";
        warningHtml = `
        <div class="mt-4 p-4 bg-red-100 border border-red-300 text-red-900 rounded-lg flex gap-3">
            <span class="material-symbols-outlined text-red-600">dangerous</span>
            <div>
                <strong>Warning: Do not use ${maxEthanol} or E85.</strong> 
                <p>Using ${maxEthanol} in this model (manufactured before ${vehicleData.compliantYear}) can cause severe engine and fuel line damage over time. Stick to standard E10 petrol.</p>
            </div>
        </div>`;
    }

    resultsContainer.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 border border-secondary/20">
            <div class="${bgColor} px-stack-md py-stack-sm flex items-center justify-between">
                <div class="flex items-center gap-3 text-white">
                    <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">${icon}</span>
                    <span class="font-headline-md text-headline-md">${title}</span>
                </div>
                <span class="bg-white/20 text-white px-3 py-1 rounded-full font-label-md text-label-md backdrop-blur-sm">${maxEthanol} Certified</span>
            </div>
            <div class="p-stack-md">
                <div class="flex flex-col md:flex-row gap-stack-md">
                    <div class="flex-1 space-y-stack-sm">
                        <h4 class="font-headline-md text-headline-md text-primary">Technical Approval Details</h4>
                        <p class="font-body-md text-on-surface-variant">${vehicleData.note}</p>
                        ${warningHtml}
                    </div>
                    <div class="md:w-1/3 bg-surface-container-low p-stack-md rounded-xl border border-outline-variant/30 text-center flex flex-col justify-center items-center">
                        <span class="material-symbols-outlined text-secondary text-5xl mb-2">local_gas_station</span>
                        <p class="font-label-md text-label-md text-secondary uppercase font-bold mb-1">Optimal Blend</p>
                        <p class="font-display-lg text-4xl text-primary mb-2">${maxEthanol}</p>
                    </div>
                </div>
                <div class="mt-stack-md pt-stack-sm border-t border-outline-variant flex justify-between items-center">
                    <p class="text-caption text-outline">Selected: ${year} ${brand} ${model}</p>
                    <button onclick="location.reload()" class="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                        Check another vehicle <span class="material-symbols-outlined">refresh</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showError(msg) {
    resultsContainer.innerHTML = `<div class="p-4 bg-red-100 text-red-800 rounded-lg text-center">${msg}</div>`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://ethanolcompliance-db-2026.s3.amazonaws.com/database.json');
        if (!response.ok) throw new Error("Failed to fetch");
        fullDatabase = await response.json();
        populateBrands(); // Default to cars
    } catch (e) {
        console.error(e);
        if (brandSelect) brandSelect.innerHTML = '<option>Error loading data</option>';
    }
});

if (typeSelect) typeSelect.addEventListener('change', populateBrands);
if (brandSelect) brandSelect.addEventListener('change', updateModels);
if (modelSelect) modelSelect.addEventListener('change', updateYears);
if (yearSelect) yearSelect.addEventListener('change', () => {
    checkButton.disabled = !yearSelect.value;
});
if (checkButton) checkButton.addEventListener('click', checkCompliance);