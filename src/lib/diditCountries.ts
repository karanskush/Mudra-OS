// Comprehensive country and document support data from Didit API
// Based on https://docs.didit.me/reference/supported-documents-id-verification

export interface DiditCountry {
  country: string;
  countryCode: string;
  flag: string;
  documents: {
    passport?: number; // 1 or 2 sides
    idCard?: number;   // 1 or 2 sides  
    driverLicense?: number; // 2 sides
    residencePermit?: number; // 1 or 2 sides
  };
}

export const DIDIT_COUNTRIES: DiditCountry[] = [
  {
    country: "Afghanistan",
    countryCode: "AF",
    flag: "🇦🇫",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Albania", 
    countryCode: "AL",
    flag: "🇦🇱",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Algeria",
    countryCode: "DZ", 
    flag: "🇩🇿",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Argentina",
    countryCode: "AR",
    flag: "🇦🇷", 
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Austria",
    countryCode: "AT",
    flag: "🇦🇹",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Belgium",
    countryCode: "BE",
    flag: "🇧🇪",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Canada",
    countryCode: "CA",
    flag: "🇨🇦", 
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹", 
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Mexico",
    countryCode: "MX",
    flag: "🇲🇽",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Netherlands",
    countryCode: "NL",
    flag: "🇳🇱",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Nigeria",
    countryCode: "NG",
    flag: "🇳🇬",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Poland",
    countryCode: "PL",
    flag: "🇵🇱",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Portugal", 
    countryCode: "PT",
    flag: "🇵🇹",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Russia",
    countryCode: "RU",
    flag: "🇷🇺",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "Spain",
    countryCode: "ES",
    flag: "🇪🇸",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Sweden",
    countryCode: "SE",
    flag: "🇸🇪",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Switzerland",
    countryCode: "CH",
    flag: "🇨🇭",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Turkey",
    countryCode: "TR",
    flag: "🇹🇷",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "Ukraine",
    countryCode: "UA",
    flag: "🇺🇦",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "United Arab Emirates",
    countryCode: "AE",
    flag: "🇦🇪",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    documents: { passport: 1, idCard: 2, driverLicense: 2 }
  },
  {
    country: "United States of America",
    countryCode: "US",
    flag: "🇺🇸",
    documents: { passport: 1, idCard: 2, driverLicense: 2, residencePermit: 2 }
  }
];

// Helper functions for working with country data
export const getCountryByCode = (code: string): DiditCountry | undefined => {
  return DIDIT_COUNTRIES.find(country => country.countryCode === code);
};

export const getAvailableDocuments = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  if (!country) return [];
  
  const documents: string[] = [];
  if (country.documents.passport) documents.push('passport');
  if (country.documents.idCard) documents.push('idCard');
  if (country.documents.driverLicense) documents.push('driverLicense');
  if (country.documents.residencePermit) documents.push('residencePermit');
  
  return documents;
};

export const searchCountries = (query: string): DiditCountry[] => {
  if (!query.trim()) return DIDIT_COUNTRIES;
  
  const searchTerm = query.toLowerCase();
  return DIDIT_COUNTRIES.filter(country =>
    country.country.toLowerCase().includes(searchTerm) ||
    country.countryCode.toLowerCase().includes(searchTerm)
  );
};

export const formatDocumentName = (docType: string): string => {
  switch (docType) {
    case 'passport': return 'Passport';
    case 'idCard': return 'National ID Card';
    case 'driverLicense': return 'Driver\'s License';
    case 'residencePermit': return 'Residence Permit';
    default: return docType;
  }
}; 