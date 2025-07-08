# Enhanced KYC System with Didit Integration

## Overview

This enhanced KYC (Know Your Customer) system now supports **220+ countries** and integrates with [Didit's global verification network](https://docs.didit.me/reference/id-verification-core-technology) for comprehensive identity verification.

## Key Features

### 🌍 Global Coverage
- **220+ countries and territories** supported
- **130+ languages** for document verification
- **4000+ document types** recognized
- Real-time country search and filtering

### 📄 Document Types Supported
Based on country, the system supports:
- **Passport** verification (1 or 2 sides)
- **National ID Card** verification (1 or 2 sides)
- **Driver's License** verification (2 sides)
- **Residence Permit** verification (1 or 2 sides)

### 🔒 Advanced Security Features
- **Document authenticity** verification
- **Tamper detection** and image integrity analysis
- **Document liveness** detection to prevent fraud
- **Face matching** (1:1) capabilities
- **AML screening** integration
- **Risk assessment** scoring

## Components

### 1. Enhanced Country Selector (`EnhancedCountrySelector.tsx`)
- Searchable dropdown with 220+ countries
- Popular countries section for quick access
- Real-time document type preview
- Flag display and country codes
- Mobile-responsive design

### 2. Didit API Client (`diditApi.ts`)
- Complete Didit API integration
- Document verification endpoints
- Face matching capabilities
- AML screening functions
- Error handling and validation

### 3. Country Data (`diditCountries.ts`)
- Comprehensive country database
- Document type mappings
- Search functionality
- Helper utilities

### 4. Utility Functions (`utils.ts`)
- UUID v4 generation for user IDs
- Session-based user ID management
- File size formatting
- Cross-browser compatibility
- Development environment detection

### 5. Updated KYC Flow (`KYCFlow.tsx`)
- Integrated country selection
- Auto-verification on file upload
- Real-time progress tracking
- Enhanced error handling
- Automatic UUID generation for users

## API Endpoints

### Backend (`backend/api/kyc.go`)

#### GET `/api/kyc/countries?search={query}`
Fetch supported countries with optional search filtering.

**Response:**
```json
{
  "success": true,
  "countries": [
    {
      "country": "United States of America",
      "documents": ["passport", "idCard", "driverLicense", "residencePermit"],
      "description": "USA - State-issued IDs and federal documents"
    }
  ],
  "total": 30
}
```

#### POST `/api/kyc/verify/didit`
Verify documents through Didit API integration.

**Request:**
```json
{
  "document_image": "base64_encoded_image",
  "document_type": "passport",
  "country_code": "US",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "face_image": "base64_encoded_face_image" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verification_id": "didit_f47ac10b-58cc-4372-a567-0e02b2c3d479_passport",
    "status": "verified",
    "document_verification": {
      "document_type": "passport",
      "status": "verified",
      "extracted_data": {
        "full_name": "John Doe",
        "date_of_birth": "1990-01-01",
        "document_number": "123456789",
        "nationality": "US"
      },
      "verification_checks": {
        "document_authenticity": true,
        "data_consistency": true,
        "image_quality": true,
        "document_liveness": true
      }
    },
    "risk_assessment": {
      "overall_score": 95,
      "risk_level": "low",
      "flags": []
    },
    "processing_time_ms": 1200
  }
}
```

## Setup Instructions

### 1. Environment Variables
Create a `.env` file with:

**For Vite-based React apps:**
```env
# Didit API Configuration
VITE_DIDIT_API_KEY=your_didit_api_key_here
VITE_DIDIT_ENVIRONMENT=sandbox

# Backend API URL (optional, defaults to relative paths)
VITE_API_URL=http://localhost:8080
```

**For Create React App:**
```env
# Didit API Configuration
REACT_APP_DIDIT_API_KEY=your_didit_api_key_here
REACT_APP_DIDIT_ENVIRONMENT=sandbox

# Backend API URL (optional, defaults to relative paths)
REACT_APP_API_URL=http://localhost:8080
```

> **Note:** The system includes automatic fallbacks and works without environment variables for development/demo purposes.

### 2. Didit API Key
1. Sign up at [Didit Console](https://console.didit.me)
2. Create a new project
3. Get your API key from the dashboard
4. Add it to your environment variables

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
# Frontend
npm start

# Backend
cd backend
go run main.go
```

## Usage Examples

### Country Selection
```typescript
import EnhancedCountrySelector from './components/EnhancedCountrySelector';

<EnhancedCountrySelector
  onCountrySelect={(country) => {
    console.log('Selected:', country.country);
    console.log('Available docs:', getAvailableDocuments(country.countryCode));
  }}
  isLoading={false}
  selectedCountry={null}
/>
```

### Document Verification
```typescript
import { KYCApi } from './lib/kycApi';
import { getSessionUserId } from './lib/utils';

const verifyDocument = async (file: File, docType: string, countryCode: string) => {
  try {
    const userId = getSessionUserId(); // Generates UUID automatically
    const result = await KYCApi.verifyDocumentWithDidit(
      userId,
      docType,
      file,
      countryCode
    );
    
    if (result.status === 'verified') {
      console.log('Document verified:', result.document_verification.extracted_data);
      console.log('User ID:', userId); // e.g., "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8"
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
};
```

### UUID Generation
```typescript
import { generateUUID, getSessionUserId, isValidUUID } from './lib/utils';

// Generate a new UUID
const newId = generateUUID();
console.log(newId); // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Get session-persistent user ID
const userId = getSessionUserId(); // Same ID throughout the browser session

// Validate UUID format
const isValid = isValidUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // true
```

## Supported Countries (Sample)

| Country | Passport | ID Card | Driver License | Residence Permit |
|---------|----------|---------|----------------|------------------|
| 🇺🇸 United States | ✅ | ✅ | ✅ | ✅ |
| 🇬🇧 United Kingdom | ✅ | ✅ | ✅ | ❌ |
| 🇩🇪 Germany | ✅ | ✅ | ✅ | ✅ |
| 🇫🇷 France | ✅ | ✅ | ✅ | ✅ |
| 🇮🇳 India | ✅ | ✅ | ✅ | ✅ |
| 🇨🇦 Canada | ✅ | ✅ | ✅ | ✅ |
| 🇦🇺 Australia | ✅ | ✅ | ✅ | ❌ |
| 🇯🇵 Japan | ✅ | ✅ | ✅ | ✅ |

*Full list includes 220+ countries*

## Security Considerations

### Data Protection
- All images are processed securely through Didit's encrypted APIs
- Base64 encoding for secure transmission
- No permanent storage of biometric data
- GDPR and SOC 2 compliant processing

### Fraud Prevention
- **Document liveness detection** prevents screen captures
- **Template matching** against certified databases
- **Security feature validation** (holograms, watermarks)
- **Real-time risk scoring** and flagging

### Compliance
- **KYC/AML regulations** compliance
- **International identity verification** standards
- **Bank-grade security** protocols
- **Audit trails** for regulatory reporting

## Customization

### Adding New Countries
Add entries to `src/lib/diditCountries.ts`:
```typescript
{
  country: "New Country",
  countryCode: "NC",
  flag: "🏳️",
  documents: { passport: 1, idCard: 2, driverLicense: 2 }
}
```

### Custom Document Types
Extend the document type enum and add formatting:
```typescript
export const formatDocumentName = (docType: string): string => {
  switch (docType) {
    case 'customDoc': return 'Custom Document';
    // ... existing cases
  }
};
```

## Performance Optimization

- **Lazy loading** of country data
- **Debounced search** for better UX
- **Image compression** before upload
- **Parallel API calls** where possible
- **Caching** of verification results

## Monitoring & Analytics

The system provides:
- **Processing time** metrics
- **Success/failure rates** by country
- **Document type** usage statistics
- **Risk score** distributions
- **User flow** analytics

## Troubleshooting

### Environment Variable Issues

**Error: `process is not defined`**
- ✅ **Fixed**: The system now uses a cross-platform environment utility
- Use `VITE_*` variables for Vite projects
- Use `REACT_APP_*` variables for Create React App projects

**Missing API Key**
- The system falls back to `demo-api-key` for development
- Real verification requires a valid Didit API key
- Get your key from [Didit Console](https://console.didit.me)

**CORS Issues**
- Backend and frontend should run on same domain in production
- For development, ensure backend has CORS headers configured
- Check `backend/api/kyc.go` for CORS settings

### Common Issues

**Country selector not loading**
- Check if backend is running on correct port
- Verify `/api/kyc/countries` endpoint is accessible
- Check browser console for network errors

**Document upload failing**
- Ensure file is under 5MB
- Only JPG, PNG formats supported
- Check file validation in browser console

**Invalid user_id format error**
- ✅ **Fixed**: System now generates proper UUIDs automatically
- User IDs are stored in sessionStorage for consistency
- Each browser session gets a unique UUID v4

## Support

For issues related to:
- **Didit API**: [Didit Support](https://docs.didit.me)
- **Implementation**: Check the component documentation
- **Country data**: Refer to the supported documents list
- **Environment Setup**: See troubleshooting section above

## Future Enhancements

### Planned Features
- **Video KYC** integration
- **Biometric authentication** (fingerprint, face)
- **Continuous monitoring** for AML
- **Multi-language** UI support
- **Advanced analytics** dashboard
- **Webhook notifications** for real-time updates

### API Improvements
- **Batch processing** for multiple documents
- **OCR enhancement** for poor quality images
- **Machine learning** risk scoring
- **Blockchain** verification receipts 