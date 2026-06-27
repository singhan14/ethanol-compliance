import re

with open('index.html', 'r') as f:
    html = f.read()

# Change grid layout
html = html.replace('<div class="md:col-span-5 space-y-2">', '<div class="md:col-span-4 space-y-2">')

# Add IDs to selects
html = html.replace('<select class="w-full h-14 pl-12 pr-4 bg-white/60', '<select id="car-brand" class="w-full h-14 pl-12 pr-4 bg-white/60', 1)
html = html.replace('<select class="w-full h-14 pl-12 pr-4 bg-white/60', '<select id="car-model" class="w-full h-14 pl-12 pr-4 bg-white/60', 1)

# Add Year select before Submit
year_select_html = """
<div class="md:col-span-2 space-y-2">
<label class="block font-label-md text-label-md text-on-surface-variant px-2">Year</label>
<div class="relative">
<select id="car-year" class="w-full h-14 pl-4 pr-4 bg-white/60 border border-outline-variant rounded-lg font-body-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" disabled>
<option disabled="" selected="" value="">Year</option>
</select>
</div>
</div>
"""

html = html.replace('<!-- Submit -->', '<!-- Year Selection -->\n' + year_select_html + '\n<!-- Submit -->')

# Change verify button
html = html.replace('onclick="simulateVerification()"', 'id="check-button" disabled')

# Replace the simulateVerification script with external script
html = re.sub(r'<script>\s*function simulateVerification\(\)[\s\S]*?</script>', '<script src="script.js"></script>', html)

# Add an element for result-message inside results-container
result_html = """
<div id="result-message" class="opacity-0 hidden">
    <p class="font-headline-md text-headline-md font-bold mb-2"></p>
    <p class="font-body-md text-body-md"></p>
</div>
"""
html = html.replace('<div class="mt-stack-lg max-w-4xl mx-auto" id="results-container">', '<div class="mt-stack-lg max-w-4xl mx-auto" id="results-container">\n' + result_html)


with open('index.html', 'w') as f:
    f.write(html)

with open('script.js', 'r') as f:
    js = f.read()

# Update script.js to showResult appropriately without removing placeholder initially, just hiding it
js = js.replace("resultMessage.className = 'mt-8 p-6 rounded-lg text-center transition-opacity duration-500';", "resultMessage.className = 'mt-8 p-6 rounded-lg text-center transition-opacity duration-500'; document.getElementById('placeholder-state').style.display = 'none'; resultMessage.classList.remove('hidden');")

with open('script.js', 'w') as f:
    f.write(js)

print("Patched successfully")
