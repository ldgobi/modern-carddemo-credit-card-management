# Credit Card Management System

This is a comprehensive credit card management microfrontend application built with Next.js 15, React 19, TypeScript, and TailwindCSS v4.

## Overview

The Credit Card Management System provides functionality for viewing, searching, and updating credit card information. It implements three main business processes from the legacy COBOL system:

1. **Credit Card List (COCRDLIC)** - Browse and filter credit cards with pagination
2. **Credit Card Detail View (COCRDSLC)** - View detailed information about a specific card
3. **Credit Card Update (COCRDUPC)** - Update card information with validation and confirmation

## Features

### 1. Credit Card List (`/credit-cards`)
- **Pagination**: Display up to 7 cards per page
- **Filtering**: Filter by Account ID (11 digits) and/or Card Number (16 digits)
- **Search**: Real-time validation of search criteria
- **Actions**: View details or update cards directly from the list
- **Navigation**: Previous/Next page navigation
- **Empty States**: Appropriate messages when no cards are found

### 2. Credit Card Detail View (`/credit-cards/[cardNumber]`)
- **Card Information**: Display all card details including:
  - Card Number (masked for security)
  - Account ID
  - Embossed Name
  - CVV Code (masked)
  - Expiration Date
  - Active Status
- **Actions**: Edit card or return to list
- **Error Handling**: Graceful handling of not found or error states

### 3. Credit Card Update (`/credit-cards/[cardNumber]/edit`)
- **Editable Fields**:
  - Embossed Name (alphabets and spaces only, max 50 characters)
  - Active Status (Y/N)
  - Expiration Month (1-12)
  - Expiration Year (1950-2099)
- **Read-Only Fields**: Card Number and Account ID
- **Validation**: Real-time validation with error messages
- **Confirmation**: Confirmation dialog before saving changes
- **Concurrent Modification Detection**: Handles 409 conflict errors

### 4. Credit Card Search (`/credit-cards/search`)
- **Search Criteria**: Search by Account ID and/or Card Number
- **Validation**: At least one criterion must be provided
- **Results**: Display found card with actions to view or update
- **Error Handling**: Clear error messages for not found or invalid criteria

## Technical Implementation

### Architecture

The application follows a 7-layer architecture:

```
User Interface (Browser)
    ↕
Pages Layer (/src/app/credit-cards/)
    ↕
Components Layer (/src/components/ui/)
    ↕
Services Layer (/src/services/creditCardService.ts)
    ↕
API Routes Layer (/src/app/api/credit-cards/)
    ↕
Backend API (External)
```

### File Structure

```
src/
├── types/
│   └── creditCard.ts                    # TypeScript interfaces and validation
├── services/
│   └── creditCardService.ts             # API client service
├── app/
│   ├── api/
│   │   └── credit-cards/
│   │       ├── route.ts                 # GET /api/credit-cards (list)
│   │       ├── [cardNumber]/
│   │       │   └── route.ts             # GET/PUT /api/credit-cards/:cardNumber
│   │       └── search/
│   │           └── route.ts             # GET /api/credit-cards/search
│   └── credit-cards/
│       ├── page.tsx                     # List page
│       ├── search/
│       │   └── page.tsx                 # Search page
│       └── [cardNumber]/
│           ├── page.tsx                 # Detail page
│           └── edit/
│               └── page.tsx             # Edit page
└── components/
    └── ui/                              # Reusable UI components
```

### API Endpoints

#### 1. List Credit Cards
```
GET /api/credit-cards?accountId={accountId}&cardNumber={cardNumber}&page={page}
```
- **Query Parameters**:
  - `accountId` (optional): 11-digit account identifier
  - `cardNumber` (optional): 16-digit card number
  - `page` (optional): Page number (default: 1)
- **Response**: Paginated list with max 7 records per page

#### 2. Get Card Details
```
GET /api/credit-cards/{cardNumber}
```
- **Path Parameters**:
  - `cardNumber`: 16-digit card number
- **Response**: Full card details

#### 3. Search Credit Card
```
GET /api/credit-cards/search?accountId={accountId}&cardNumber={cardNumber}
```
- **Query Parameters**:
  - `accountId` (optional): 11-digit account identifier
  - `cardNumber` (optional): 16-digit card number
  - At least one parameter is required
- **Response**: Single card matching criteria

#### 4. Update Credit Card
```
PUT /api/credit-cards/{cardNumber}
```
- **Path Parameters**:
  - `cardNumber`: 16-digit card number
- **Request Body**:
```json
{
  "cardNumber": "string (16 digits)",
  "accountId": "string (11 digits)",
  "embossedName": "string (max 50 chars, alphabets and spaces only)",
  "activeStatus": "Y" | "N",
  "expirationMonth": number (1-12),
  "expirationYear": number (1950-2099)
}
```
- **Response**: Updated card details
- **Error Codes**:
  - `400`: Validation error
  - `404`: Card not found
  - `409`: Concurrent modification detected

### Data Validation

#### Card Number
- Must be exactly 16 digits
- Numeric only
- Displayed masked: `**** **** **** 1234`

#### Account ID
- Must be exactly 11 digits
- Numeric only

#### Embossed Name
- Required field
- Alphabets and spaces only
- Maximum 50 characters
- Converted to uppercase before storage

#### Active Status
- Must be 'Y' (Active) or 'N' (Inactive)
- Displayed as badge with color coding

#### Expiration Month
- Must be between 1 and 12
- Numeric only

#### Expiration Year
- Must be between 1950 and 2099
- Numeric only

### Business Rules

#### From COCRDUPC (Credit Card Update)
1. Only embossed name, active status, and expiration date can be updated
2. Card number and account ID are read-only
3. All changes require user confirmation
4. System checks for concurrent modifications before updating
5. Validation errors prevent submission
6. Success redirects to detail view

#### From COCRDSLC (Credit Card Detail View)
1. Card details are displayed in read-only format
2. CVV code is always masked for security
3. Card number is masked except last 4 digits
4. Navigation to edit or back to list is provided

#### From COCRDLIC (Credit Card List)
1. Maximum 7 cards displayed per page
2. Pagination with Previous/Next navigation
3. Filtering by account ID and/or card number
4. Input validation before search
5. Empty state messages for no results
6. Quick actions for view and update

### Error Handling

The application handles various error scenarios:

1. **Validation Errors**: Real-time validation with inline error messages
2. **Not Found (404)**: Clear messages when cards don't exist
3. **Concurrent Modification (409)**: Alert user to refresh and try again
4. **Server Errors (500)**: Generic error message with option to retry
5. **Network Errors**: Caught and displayed to user

### Loading States

All pages implement loading states:
- Spinner animation during data fetching
- Disabled buttons during operations
- Loading text indicators

### Empty States

Appropriate empty states for:
- No cards found in list
- No search results
- Card not found in detail view

## Usage

### Viewing Credit Cards
1. Navigate to `/credit-cards`
2. Optionally filter by Account ID or Card Number
3. Click "Search" to apply filters
4. Use "Previous" and "Next" to navigate pages
5. Click "View" to see card details
6. Click "Update" to edit card information

### Searching for a Card
1. Navigate to `/credit-cards/search`
2. Enter Account ID and/or Card Number
3. Click "Search"
4. View results and take actions

### Updating a Card
1. From list or detail view, click "Update" or "Edit"
2. Modify editable fields
3. Click "Save Changes"
4. Confirm changes in dialog
5. System validates and saves

## Security Considerations

1. **CVV Masking**: CVV codes are always masked in the UI
2. **Card Number Masking**: Only last 4 digits shown in lists
3. **Authentication**: All API calls include authentication headers
4. **Validation**: Server-side validation prevents invalid data
5. **Concurrent Modification**: Prevents data loss from simultaneous edits

## Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

## Testing

The application should be tested for:
1. Input validation
2. Pagination functionality
3. Search and filter operations
4. Update operations with confirmation
5. Error handling scenarios
6. Loading states
7. Empty states
8. Responsive design

## Future Enhancements

Potential improvements:
1. Bulk operations (update multiple cards)
2. Export functionality (CSV, PDF)
3. Advanced filtering (date ranges, status)
4. Card activity history
5. Audit trail
6. Card activation/deactivation workflow
7. Expiration date warnings
8. Card replacement functionality

## Support

For issues or questions, please contact the development team.

## License

Copyright © 2024. All rights reserved.
