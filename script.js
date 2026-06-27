let compliantCars = {};

const brandSelect = document.getElementById('car-brand');
const modelSelect = document.getElementById('car-model');
const yearSelect = document.getElementById('car-year');
const checkButton = document.getElementById('check-button');
const resultMessage = document.getElementById('result-message');
const resultText = resultMessage?.querySelector('p:first-child');
const resultSubText = resultMessage?.querySelector('p:last-child');

const monthlyKmInput = document.getElementById('monthly-km');
const carMileageInput = document.getElementById('car-mileage');
const petrolPriceE10Input = document.getElementById('petrol-price-e10');
const petrolPriceE20Input = document.getElementById('petrol-price-e20');
const calculateButton = document.getElementById('calculate-expense');
const calculatorResultDiv = document.getElementById('calculator-result');
const e10ExpenseText = document.getElementById('e10-expense');
const e20ExpenseText = document.getElementById('e20-expense');
const gainLossResultDiv = document.getElementById('gain-loss-result');
const gainLossText = document.getElementById('gain-loss-text');

function populateBrands() {
    if (!brandSelect) return;
    brandSelect.innerHTML = '<option value="">-- Select a Brand --</option>';
    const brands = Object.keys(compliantCars).sort();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

function updateModels() {
    const selectedBrand = brandSelect.value;
    modelSelect.innerHTML = '<option value="">-- Select a Model --</option>';
    yearSelect.innerHTML = '<option value="">-- Select Year --</option>';
    modelSelect.disabled = true;
    yearSelect.disabled = true;
    checkButton.disabled = true;
    hideResult();

    if (compliantCars[selectedBrand]) {
        modelSelect.disabled = false;
        const models = [...new Set(compliantCars[selectedBrand].map(car => car.model))].sort();
        models.forEach(modelName => {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        });
    }
}

function updateYears() {
    yearSelect.innerHTML = '<option value="">-- Select Year --</option>';
    yearSelect.disabled = true;
    checkButton.disabled = true;
    hideResult();

    const selectedBrand = brandSelect.value;
    const selectedModel = modelSelect.value;

    if (selectedModel) {
        const carData = compliantCars[selectedBrand]?.find(car => car.model === selectedModel);
        if (carData && carData.productionStart) {
            yearSelect.disabled = false;
            const startYear = carData.productionStart;
            const endYear = carData.productionEnd || new Date().getFullYear();
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
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const year = parseInt(yearSelect.value, 10);
    const carData = compliantCars[brand]?.find(car => car.model === model);

    if (carData) {
        let isCompliant = carData.compliant;
        // If a compliance year is specified, the selected year must be >= that year.
        if (carData.year && year < carData.year) {
            isCompliant = false;
        }

        if (isCompliant) {
             showResult(
                `✅ Yes, your ${year} ${brand} ${model} is E20 Compliant.`,
                carData.note || `Models from ${carData.year || 'this period'} onwards are generally compatible.`,
                'bg-green-100', 'text-green-800'
            );
        } else {
             showResult(
                `❌ No, your ${year} ${brand} ${model} is likely NOT E20 Compliant.`,
                carData.note || `This model version was likely discontinued before E20 norms.`,
                'bg-red-100', 'text-red-800'
            );
        }
    } else {
         showResult(
            `🤔 Information Not Available`,
            `Please check your owner's manual or contact the manufacturer for the ${brand} ${model}.`,
            'bg-yellow-100', 'text-yellow-800'
        );
    }
}

function showResult(mainText, subText, bgColor, textColor) {
    if (!resultMessage) return;
    resultText.textContent = mainText;
    resultSubText.textContent = subText;
    resultMessage.className = 'mt-8 p-6 rounded-lg text-center transition-opacity duration-500'; document.getElementById('placeholder-state').style.display = 'none'; resultMessage.classList.remove('hidden');
    resultMessage.classList.add(bgColor, textColor, 'opacity-100');
}

function hideResult() {
    if (!resultMessage) return;
    resultMessage.classList.remove('opacity-100');
    resultMessage.classList.add('opacity-0');
}

function calculateMonthlyExpense() {
    const monthlyKm = parseFloat(monthlyKmInput.value);
    const carMileage = parseFloat(carMileageInput.value);
    const petrolPriceE10 = parseFloat(petrolPriceE10Input.value);
    const petrolPriceE20 = parseFloat(petrolPriceE20Input.value);

    if (isNaN(monthlyKm) || isNaN(carMileage) || isNaN(petrolPriceE10) || isNaN(petrolPriceE20) || monthlyKm <= 0 || carMileage <= 0 || petrolPriceE10 <= 0 || petrolPriceE20 <= 0) {
        alert("Please enter valid, positive numbers for all fields.");
        return;
    }

    const e10LitresNeeded = monthlyKm / carMileage;
    const e10TotalExpense = e10LitresNeeded * petrolPriceE10;

    const e20Mileage = carMileage * 0.96; // 4% mileage drop assumption
    const e20LitresNeeded = monthlyKm / e20Mileage;
    const e20TotalExpense = e20LitresNeeded * petrolPriceE20;

    e10ExpenseText.textContent = `₹${e10TotalExpense.toFixed(2)}`;
    e20ExpenseText.textContent = `₹${e20TotalExpense.toFixed(2)}`;

    const savings = e10TotalExpense - e20TotalExpense;
    if (savings > 0) {
        gainLossText.textContent = `You SAVE ₹${savings.toFixed(2)} per month by using E20.`;
        gainLossResultDiv.className = 'mt-4 p-4 rounded-lg text-center bg-green-200 text-green-800';
    } else {
        gainLossText.textContent = `You could lose ₹${Math.abs(savings).toFixed(2)} per month with E20.`;
        gainLossResultDiv.className = 'mt-4 p-4 rounded-lg text-center bg-red-200 text-red-800';
    }

    calculatorResultDiv.classList.remove('hidden');
    setTimeout(() => calculatorResultDiv.classList.add('opacity-100'), 10);
}

// Fade-in animations for sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-section').forEach(section => {
    observer.observe(section);
});

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Only run the data fetching on the main page
    if (brandSelect) {
        try {
            const functionUrl = 'https://getcardata-agjntd556a-uc.a.run.app';
            const response = await fetch(functionUrl);
            if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
            compliantCars = await response.json();
            populateBrands();
        } catch (error) {
            console.error("Failed to fetch car data:", error);
            brandSelect.innerHTML = '<option>Error loading data</option>';
        }
    }
});

if (brandSelect) brandSelect.addEventListener('change', updateModels);
if (modelSelect) modelSelect.addEventListener('change', updateYears);
if (yearSelect) yearSelect.addEventListener('change', () => {
    checkButton.disabled = !yearSelect.value;
    hideResult();
});
if (checkButton) checkButton.addEventListener('click', checkCompliance);
if (calculateButton) calculateButton.addEventListener('click', calculateMonthlyExpense);