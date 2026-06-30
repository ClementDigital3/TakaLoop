const FACTORS = { plastics:1.5,metals:2.1,paper:0.8,ewaste:3.2,organics:0.5,hazardous:4.0,glass:0.6,textiles:1.2,rubber:1.8,other:1.0 };
exports.calculateCarbonOffset = (cat, kg) => +((kg * (FACTORS[cat]||1.0)).toFixed(2));
exports.carbonToCredits = (kg) => +(kg/1000).toFixed(4);
