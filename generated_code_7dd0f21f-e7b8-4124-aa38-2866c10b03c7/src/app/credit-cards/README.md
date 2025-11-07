# Credit Card Management Module

## Overview

This module implements a complete Credit Card Management system based on the COBOL programs COCRDLIC, COCRDSLC, and COCRDUPC. It provides functionality for listing, viewing, and updating credit card information.

## Module Structure

```
credit-cards/
├── page.tsx                          # List page (COCRDLIC)
├── [cardNumber]/
│   ├── page.tsx                      # Detail page (COCRDSLC)
│   └── edit/
│       └── page.tsx                  # Edit page (COCRDUPC)
└── README.md                         # This file
```

## Pages

### 1. List Page (`page.tsx`)
**Route**: `/credit-cards`
**Program**: COCRDLIC - Credit Card List Program

**Features**:
- Search by Account ID (11 digits) and/or Card Number (16 digits)
- Paginated results (max 7 per page)
- Keyboard navigation (F7/F8)
- Masked card numbers for security
- Status badges (Active/Inactive)
- Click to view details or edit

**State Management**:
- `cards` - Array of credit cards
- `currentPage` - Current page number
- `hasNext` - Has next page flag
- `hasPrevious` - Has previous page flag
- `loading` - Loading state
- `error` - Error message
- `accountIdFilter` - Account ID filter value
- `cardNumberFilter` - Card Number filter value

**Key Functions**:
- `fetchCards(page)` - Fetch cards with filters
- `handleSearch()` - Validate and search
- `handleNextPage()` - Navigate to next page
- `handlePreviousPage()` - Navigate to previous page
- `validateFilters()` - Validate search inputs

### 2. Detail Page (`[cardNumber]/page.tsx`)
**Route**: `/credit-cards/{cardNumber}`
**Program**: COCRDSLC - Credit Card Detail View

**Features**:
- Display full card information
- Card-style visual presentation
- Masked card number
- CVV code display
- Expiration date formatting
- Status badge
- Edit and Back buttons

**State Management**:
- `card` - Credit card object
- `loading` - Loading state
- `error` - Error message

**Key Functions**:
- `fetchCard(cardNumber)` - Fetch card details
- `updateDateTime()` - Update clock display

### 3. Edit Page (`[cardNumber]/edit/page.tsx`)
**Route**: `/credit-cards/{cardNumber}/edit`
**Program**: COCRDUPC - Credit Card Update Program

**Features**:
- Load existing card data
- Side-by-side comparison (old vs new)
- Editable fields: name, status, expiration
- Read-only fields: card number, account ID
- Real-time validation
- Confirmation modal
- Success/error modals
- Concurrent modification handling

**State Management**:
- `originalCard` - Original card data
- `formData` - Form input values
- `errors` - Validation errors
- `loading` - Loading state
- `saving` - Saving state
- `showConfirmModal` - Confirmation modal visibility
- `showSuccessModal` - Success modal visibility
- `showNoChangesModal` - No changes modal visibility
- `showConflictModal` - Conflict modal visibility

**Key Functions**:
- `fetchCard(cardNumber)` - Load card data
- `validateForm()` - Validate all inputs
- `hasChanges()` - Detect changes
- `handleSubmit()` - Handle form submission
- `handleConfirmSave()` - Save changes to API

## Validation Rules

### Account ID
- Must be exactly 11 digits
- Numeric only
- Required for search (if card number not provided)

### Card Number
- Must be exactly 16 digits
- Numeric only
- Required for search (if account ID not provided)

### Embossed Name
- Alphabets and spaces only
- Maximum 50 characters
- Required
- Auto-sanitized (removes invalid characters)

### Active Status
- Must be 'Y' (Active) or 'N' (Inactive)
- Required
- Dropdown selection

### Expiration Month
- Must be between 1 and 12
- Numeric only
- Required

### Expiration Year
- Must be between 1950 and 2099
- Numeric only
- Required

## API Integration

### Endpoints Used

1. **GET /api/credit-cards**
   - List cards with pagination
   - Query params: accountId, cardNumber, page

2. **GET /api/credit-cards/{cardNumber}**
   - Get single card details

3. **PUT /api/credit-cards/{cardNumber}**
   - Update card information
   - Handles validation and conflicts

4. **GET /api/credit-cards/search**
   - Search for specific card
   - Query params: accountId, cardNumber

### Service Layer

All API calls go through `creditCardService` from `/src/services/creditCardService.ts`:

```typescript
import { creditCardService } from '@/services/creditCardService';

// List cards
const cards = await creditCardService.getCreditCards({ 
  accountId: '12345678901', 
  page: 1 
});

// Get card details
const card = await creditCardService.getCreditCardByCardNumber('1234567890123456');

// Update card
const updated = await creditCardService.updateCreditCard('1234567890123456', {
  embossedName: 'JOHN DOE',
  activeStatus: 'Y',
  expirationMonth: 12,
  expirationYear: 2025
});

// Search cards
const result = await creditCardService.searchCreditCards({
  accountId: '12345678901',
  cardNumber: '1234567890123456'
});
```

## Type Definitions

All types are defined in `/src/types/creditCard.ts`:

```typescript
import {
  CreditCard,
  CreditCardListResponse,
  UpdateCreditCardRequest,
  validateCardNumber,
  validateAccountId,
  maskCardNumber,
  formatExpirationDate
} from '@/types/creditCard';
```

## UI Components Used

From `/src/components/ui/`:
- `Button` - Primary, secondary, danger variants
- `Input` - Text inputs with validation
- `Select` - Dropdown selections
- `Table` - Data table with actions
- `Modal` - Confirmation and notification modals

## Error Handling

### Client-Side Errors
- Input validation errors (inline)
- Network errors (alert/modal)
- Not found errors (error page)
- Loading states (spinner)

### Server-Side Errors
- 400 Bad Request - Validation errors
- 404 Not Found - Card not found
- 409 Conflict - Concurrent modification
- 500 Internal Server Error - Server errors

## Security Features

1. **Card Number Masking**
   - List view: **** **** **** XXXX
   - Detail view: **** **** **** XXXX
   - Edit view: **** **** **** XXXX

2. **Input Sanitization**
   - Embossed name auto-sanitized
   - Numeric fields validated
   - SQL injection prevention

3. **Authentication**
   - All API calls include auth headers
   - Token from localStorage

## Performance Optimizations

1. **Efficient Re-rendering**
   - React hooks for state management
   - Conditional rendering
   - Memoization where needed

2. **API Calls**
   - Debounced input validation
   - Minimal re-fetching
   - Error boundary handling

3. **Loading States**
   - Skeleton screens
   - Progress indicators
   - Optimistic updates

## Accessibility

1. **Keyboard Navigation**
   - F7 for previous page
   - F8 for next page
   - Tab navigation
   - Enter to submit

2. **Screen Readers**
   - Semantic HTML
   - ARIA labels
   - Error announcements

3. **Visual Indicators**
   - Color-coded status
   - Error highlighting
   - Focus indicators

## Testing Checklist

### List Page
- [ ] Search with valid Account ID
- [ ] Search with valid Card Number
- [ ] Search with both filters
- [ ] Invalid Account ID error
- [ ] Invalid Card Number error
- [ ] No search criteria error
- [ ] Pagination forward
- [ ] Pagination backward
- [ ] Click to view details
- [ ] Click to edit
- [ ] Empty state display
- [ ] Loading state display

### Detail Page
- [ ] Load valid card
- [ ] Handle not found (404)
- [ ] Display all fields correctly
- [ ] Masked card number
- [ ] Formatted expiration date
- [ ] Status badge color
- [ ] Edit button navigation
- [ ] Back button navigation

### Edit Page
- [ ] Load card data
- [ ] Display old vs new values
- [ ] Validate embossed name
- [ ] Validate active status
- [ ] Validate expiration month
- [ ] Validate expiration year
- [ ] Detect no changes
- [ ] Show confirmation modal
- [ ] Save successfully
- [ ] Handle concurrent modification
- [ ] Cancel without saving
- [ ] Loading state during save

## Troubleshooting

### Common Issues

**Issue**: Cards not loading
- Check backend API is running
- Verify API_BASE_URL in .env
- Check browser console for errors
- Verify authentication token

**Issue**: Validation errors
- Check input format (digits only)
- Verify length requirements
- Check for special characters

**Issue**: Save fails
- Check all required fields
- Verify validation passes
- Check for concurrent modifications
- Verify backend API response

**Issue**: Pagination not working
- Check if hasNext/hasPrevious flags
- Verify page parameter in API call
- Check total records count

## Future Enhancements

1. Add card creation functionality
2. Implement card deletion
3. Add bulk operations
4. Implement export to CSV/PDF
5. Add advanced filtering
6. Implement sorting
7. Add audit log viewing
8. Implement card activation workflow
9. Add print functionality
10. Implement card search history

## Related Documentation

- [Implementation Summary](../../../CREDIT_CARD_IMPLEMENTATION.md)
- [Quick Start Guide](../../../CREDIT_CARD_QUICK_START.md)
- [Archetype Guide](../../../archetype.md)
- [API Documentation](../api/credit-cards/README.md)

## Maintenance Notes

### Code Style
- Follow existing patterns
- Use TypeScript strictly
- Add comments for complex logic
- Keep functions small and focused

### Adding New Features
1. Update types in `/src/types/creditCard.ts`
2. Add API route in `/src/app/api/credit-cards/`
3. Update service in `/src/services/creditCardService.ts`
4. Create/update page in `/src/app/credit-cards/`
5. Test thoroughly
6. Update documentation

### Debugging
- Check browser console
- Use React DevTools
- Check Network tab
- Review API responses
- Check validation logic

## Contact

For questions or issues with this module:
- Review the documentation
- Check the implementation summary
- Contact the development team
- Submit an issue in the project repository
