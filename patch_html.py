import re

with open('index.html', 'r') as f:
    html = f.read()

# Update title and meta for SEO
html = html.replace('<title>E20 India | Fuel Compatibility Checker</title>', 
"""<title>Ethanol Compliance Checker India | E20 & E85 Cars & Bikes List</title>
<meta name="description" content="Check if your car or bike in India is compliant with E20 or E85 ethanol blended petrol. Complete database of Maruti, Hyundai, Tata, Honda, Hero, TVS and more.">
<meta name="keywords" content="E20 fuel, E85 flex fuel, ethanol blended petrol, car compliance India, bike E20 compliance, check car E20 status">
""")

# We need to change the grid to accommodate 4 items: Type, Brand, Model, Year
# Previous grid: Brand (4), Model (4), Year (2), Submit (2)
# New grid: Type (2), Brand (3), Model (3), Year (2), Submit (2)

grid_start = '<div class="grid grid-cols-1 md:grid-cols-12 gap-base items-end">'
type_select_html = """
<!-- Type Selection -->
<div class="md:col-span-2 space-y-2">
<label class="block font-label-md text-label-md text-on-surface-variant px-2">Type</label>
<div class="relative">
<select id="vehicle-type" class="w-full h-14 pl-4 pr-4 bg-white/60 border border-outline-variant rounded-lg font-body-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
<option value="cars" selected>Car</option>
<option value="bikes">Bike</option>
</select>
</div>
</div>
"""

# Adjust spans
html = html.replace('<div class="md:col-span-4 space-y-2">', '<div class="md:col-span-3 space-y-2">') # Replaces both Brand and Model col-spans

html = html.replace('<!-- Make Selection -->', type_select_html + '\n<!-- Make Selection -->')

with open('index.html', 'w') as f:
    f.write(html)

print("HTML Patched successfully")
