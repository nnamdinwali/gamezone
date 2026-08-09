"use strict";
export default `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  const locale = navigator.language || 'en-US';
  const currencyMap: Record<string, string> = {
    'en-NG': 'NGN', 'en-GB': 'GBP', 'en-CA': 'CAD', 'en-AU': 'AUD',
    'en-IN': 'INR', 'en-ZA': 'ZAR', 'en-GH': 'GHS', 'en-KE': 'KES',
    'fr-FR': 'EUR', 'de-DE': 'EUR', 'es-ES': 'EUR',
  };
  const currency = currencyMap[locale] ?? 'USD';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLnRzP3JhdyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBcImltcG9ydCB7IGNsc3gsIHR5cGUgQ2xhc3NWYWx1ZSB9IGZyb20gXFxcImNsc3hcXFwiXFxuaW1wb3J0IHsgdHdNZXJnZSB9IGZyb20gXFxcInRhaWx3aW5kLW1lcmdlXFxcIlxcblxcbmV4cG9ydCBmdW5jdGlvbiBjbiguLi5pbnB1dHM6IENsYXNzVmFsdWVbXSkge1xcbiAgcmV0dXJuIHR3TWVyZ2UoY2xzeChpbnB1dHMpKVxcbn1cXG5cXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3kodmFsdWU6IG51bWJlcikge1xcbiAgY29uc3QgbG9jYWxlID0gbmF2aWdhdG9yLmxhbmd1YWdlIHx8ICdlbi1VUyc7XFxuICBjb25zdCBjdXJyZW5jeU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcXG4gICAgJ2VuLU5HJzogJ05HTicsICdlbi1HQic6ICdHQlAnLCAnZW4tQ0EnOiAnQ0FEJywgJ2VuLUFVJzogJ0FVRCcsXFxuICAgICdlbi1JTic6ICdJTlInLCAnZW4tWkEnOiAnWkFSJywgJ2VuLUdIJzogJ0dIUycsICdlbi1LRSc6ICdLRVMnLFxcbiAgICAnZnItRlInOiAnRVVSJywgJ2RlLURFJzogJ0VVUicsICdlcy1FUyc6ICdFVVInLFxcbiAgfTtcXG4gIGNvbnN0IGN1cnJlbmN5ID0gY3VycmVuY3lNYXBbbG9jYWxlXSA/PyAnVVNEJztcXG4gIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQobG9jYWxlLCB7IHN0eWxlOiAnY3VycmVuY3knLCBjdXJyZW5jeSwgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pLmZvcm1hdCh2YWx1ZSk7XFxufVxcblxcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXROdW1iZXIodmFsdWU6IG51bWJlcikge1xcbiAgcmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdChcXFwiZW4tVVNcXFwiLCB7XFxuICAgIG5vdGF0aW9uOiBcXFwiY29tcGFjdFxcXCIsXFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMSxcXG4gIH0pLmZvcm1hdCh2YWx1ZSk7XFxufVxcblwiIl0sIm1hcHBpbmdzIjoiO0FBQUEsZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTsiLCJuYW1lcyI6W119