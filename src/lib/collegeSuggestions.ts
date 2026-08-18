// Curated list of common colleges / localities used for the Preferred Location autocomplete.
export const COLLEGE_SUGGESTIONS: string[] = [
  "MIT-WPU Pune",
  "COEP Pune",
  "DY Patil University, Pune",
  "Symbiosis International University, Pune",
  "VIT Pune",
  "PICT Pune",
  "Fergusson College, Pune",
  "Kothrud, Pune",
  "Wakad, Pune",
  "Hinjawadi, Pune",
  "Viman Nagar, Pune",
  "Katraj, Pune",
  "Hadapsar, Pune",
  "Baner, Pune",
  "ADCET Ashta, Sangli",
  "Walchand College of Engineering, Sangli",
  "IIT Bombay, Mumbai",
  "VJTI Mumbai",
  "Andheri, Mumbai",
  "Powai, Mumbai",
  "Christ University, Bangalore",
  "RV College of Engineering, Bangalore",
  "Koramangala, Bangalore",
  "Whitefield, Bangalore",
  "Anna University, Chennai",
  "Osmania University, Hyderabad",
  "Delhi University, Delhi",
  "Amity University, Noida",
  "Jadavpur University, Kolkata",
];

export function filterSuggestions(q: string, limit = 6): string[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return COLLEGE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(t)).slice(0, limit);
}