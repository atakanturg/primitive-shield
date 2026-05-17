const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Colors
content = content.replace(/#FDFCF8/g, '#FAF8F5'); // Softer off-white background
content = content.replace(/#1E1B4B/g, '#13293D'); // Deep oceanic blue (less purple, more teal/deco)
content = content.replace(/#1D1D1D/g, '#13293D'); // Dark text
content = content.replace(/#FF107A/g, '#FF007F'); // Electric Pink
content = content.replace(/#00DFE6/g, '#00E5FF'); // Electric Cyan
content = content.replace(/bg-\[#FFF59D\]/g, 'bg-[#FEF08A]'); // Pastel Yellow
content = content.replace(/shadow-\[4px_4px_0_0_#FF107A\]/g, 'shadow-[0_4px_20px_-4px_rgba(255,0,127,0.4)]'); // Soft glowing pink shadow
content = content.replace(/shadow-\[4px_4px_0_0_#00DFE6\]/g, 'shadow-[0_4px_20px_-4px_rgba(0,229,255,0.4)]'); // Soft glowing cyan shadow
content = content.replace(/shadow-\[4px_4px_0_0_#FFF59D\]/g, 'shadow-[0_4px_20px_-4px_rgba(254,240,138,0.4)]'); // Soft yellow shadow
content = content.replace(/shadow-\[8px_8px_0_0_#00DFE6\]/g, 'shadow-[0_8px_30px_-4px_rgba(0,229,255,0.3)]'); // Soft glowing cyan shadow
content = content.replace(/shadow-\[8px_8px_0_0_#FFF59D\]/g, 'shadow-[0_8px_30px_-4px_rgba(254,240,138,0.3)]'); // Soft glowing yellow shadow
content = content.replace(/shadow-\[2px_2px_0_0_#FF107A\]/g, 'shadow-[0_2px_10px_-2px_rgba(255,0,127,0.3)]'); // Soft glowing pink shadow

// Brutalism -> Sophistication: Soften borders and remove harsh blacks
content = content.replace(/border-black/g, 'border-[#13293D]/10');
content = content.replace(/border-\[#1D1D1D\]/g, 'border-[#13293D]/20');
content = content.replace(/text-black/g, 'text-[#13293D]');
content = content.replace(/bg-black/g, 'bg-[#13293D]/5'); // For wrapper borders that were black
content = content.replace(/border-\[3px\]/g, 'border-2'); // Thinner borders
content = content.replace(/rounded-none/g, 'rounded-xl'); // Add some border radius for deco/sophistication
content = content.replace(/rounded-sm/g, 'rounded-md');

// Let's also add rounded corners to some main elements for that modern, less invasive feel.
// "border border-[#13293D]/10 bg-[#FEF08A]" -> "border border-[#13293D]/10 bg-[#FEF08A] rounded-2xl"
content = content.replace(/border border-\[#13293D\]\/10 bg-\[#FEF08A\]/g, 'border border-[#13293D]/10 bg-[#FEF08A] rounded-2xl');
content = content.replace(/border border-\[#13293D\]\/10 bg-white/g, 'border border-[#13293D]/10 bg-white rounded-2xl');

// To maintain legibility but mute the invasive backgrounds:
// Change large Cyan banner to Pastel Blue
content = content.replace(/bg-\[#00E5FF\] text-\[#13293D\]/g, 'bg-[#A8DADC] text-[#13293D]');
// Change large Pink banner to Pastel Pink
content = content.replace(/bg-\[#FF007F\] text-white/g, 'bg-[#FCD5CE] text-[#13293D]');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Replaced colors");
