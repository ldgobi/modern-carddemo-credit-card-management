# Credit Card Management - Quick Start Guide

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend API running (default: http://localhost:8080)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .example.env .env

# Update .env with your backend API URL
# API_BASE_URL=http://localhost:8080
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Access the Application

Open your browser and navigate to:
- **List Page**: http://localhost:3000/credit-cards
- **Detail Page**: http://localhost:3000/credit-cards/{cardNumber}
- **Edit Page**: http://localhost:3000/credit-cards/{cardNumber}/edit

## User Guide

### 1. Viewing Credit Cards List

**URL**: `/credit-cards`

**Steps**:
1. Enter Account ID (11 digits) or Card Number (16 digits) or both
2. Click "Search" button
3. View results in the table (max 7 per page)
4. Use "Previous (F7)" or "Next (F8)" buttons to navigate pages
5. Click on any row to view card details
6. Click "Edit" button to update card

**Keyboard Shortcuts**:
- `F7` - Previous page
- `F8` - Next page

**Validation Rules**:
- Account ID must be exactly 11 digits
- Card Number must be exactly 16 digits
- At least one search criterion required

### 2. Viewing Card Details

**URL**: `/credit-cards/{cardNumber}`

**Features**:
- View full card information
- Card number displayed as **** **** **** XXXX
- CVV code visible
- Expiration date in MM/YY format
- Active status with color badge
- Edit button to modify card
- Back button to return to list

### 3. Editing Card Information

**URL**: `/credit-cards/{cardNumber}/edit`

**Editable Fields**:
- **Embossed Name**: Alphabets and spaces only, max 50 characters
- **Active Status**: Y (Active) or N (Inactive)
- **Expiration Month**: 1-12
- **Expiration Year**: 1950-2099

**Read-Only Fields**:
- Card Number
- Account ID

**Steps**:
1. Modify the fields you want to change
2. Click "Save Changes" button
3. Review changes in confirmation modal
4. Click "Confirm" to save or "Cancel" to abort
5. Success modal appears after successful update
6. Click "OK" to return to detail view

**Validation Rules**:
- Embossed name: Only alphabets and spaces, max 50 chars
- Active status: Must be Y or N
- Expiration month: Must be between 1 and 12
- Expiration year: Must be between 1950 and 2099

**Special Cases**:
- **No Changes**: Modal appears if you try to save without making changes
- **Concurrent Modification**: If another user modified the card, you'll see a conflict modal and data will reload

## API Endpoints

### List Credit Cards
```
GET /api/credit-cards?accountId={accountId}&cardNumber={cardNumber}&page={page}
```

### Get Card Details
```
GET /api/credit-cards/{cardNumber}
```

### Update Card
```
PUT /api/credit-cards/{cardNumber}
Content-Type: application/json

{
  "cardNumber": "1234567890123456",
  "accountId": "12345678901",
  "embossedName": "JOHN DOE",
  "activeStatus": "Y",
  "expirationMonth": 12,
  "expirationYear": 2025
}
```

### Search Cards
```
GET /api/credit-cards/search?accountId={accountId}&cardNumber={cardNumber}
```

## Common Issues & Solutions

### Issue: "Account ID must be exactly 11 digits"
**Solution**: Ensure you enter exactly 11 numeric digits for Account ID

### Issue: "Card number must be exactly 16 digits"
**Solution**: Ensure you enter exactly 16 numeric digits for Card Number

### Issue: "Please enter at least one search criteria"
**Solution**: Enter either Account ID or Card Number (or both) before searching

### Issue: "Embossed name must contain only alphabets and spaces"
**Solution**: Remove any numbers or special characters from the name

### Issue: "No Credit Cards Found"
**Solution**: 
- Verify the Account ID or Card Number is correct
- Try different search criteria
- Check if the card exists in the system

### Issue: "Concurrent Modification Detected"
**Solution**: 
- Another user modified the card while you were editing
- Click "Reload Data" to get the latest version
- Make your changes again

### Issue: "Failed to fetch credit cards"
**Solution**:
- Check if the backend API is running
- Verify the API_BASE_URL in .env file
- Check network connectivity
- Check browser console for detailed errors

## Tips & Best Practices

1. **Search Efficiently**: Use specific filters to narrow down results
2. **Verify Before Saving**: Always review changes in the confirmation modal
3. **Handle Conflicts**: If you see a conflict error, reload and try again
4. **Use Keyboard Shortcuts**: F7 and F8 for quick pagination
5. **Check Validation**: Red error messages indicate what needs to be fixed
6. **Masked Numbers**: Card numbers are masked for security in list view

## Security Notes

- Card numbers are masked in list view (**** **** **** XXXX)
- Full card numbers visible only in detail and edit views
- CVV codes displayed only in detail view
- All API calls require authentication
- Input validation on both client and server side

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend API is running and accessible
3. Check network tab in browser dev tools
4. Review validation rules above
5. Contact system administrator if issues persist

## Feature Summary

✅ List credit cards with pagination (7 per page)
✅ Search by Account ID and/or Card Number
✅ View detailed card information
✅ Update card details (name, status, expiration)
✅ Real-time validation
✅ Confirmation before saving
✅ Concurrent modification handling
✅ Keyboard shortcuts (F7/F8)
✅ Responsive design
✅ Loading states
✅ Error handling
✅ Empty states
✅ Success notifications

## Version Information

- **Application**: Credit Card Management
- **Version**: 1.0.0
- **Framework**: Next.js 15.5.3
- **React**: 19.1.0
- **TypeScript**: 5.x
- **UI Library**: TailwindCSS v4

## Related Programs

This application implements the following COBOL programs:
- **COCRDLIC** - Credit Card List Program
- **COCRDSLC** - Credit Card Detail View
- **COCRDUPC** - Credit Card Update Program
