# Credit Card Management System - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly set up and run the Credit Card Management System.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (default: http://localhost:8080)

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create a `.env.local` file in the root directory:
```env
API_BASE_URL=http://localhost:8080
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to: http://localhost:3000

## 📱 Application Structure

### Main Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with feature cards |
| `/credit-cards` | List all credit cards (paginated) |
| `/credit-cards/search` | Search for a specific card |
| `/credit-cards/:cardNumber` | View card details |
| `/credit-cards/:cardNumber/edit` | Update card information |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/credit-cards` | GET | List cards with filters |
| `/api/credit-cards/:cardNumber` | GET | Get card details |
| `/api/credit-cards/:cardNumber` | PUT | Update card |
| `/api/credit-cards/search` | GET | Search for card |

## 🎯 Key Features

### 1. Browse Credit Cards
- Navigate to `/credit-cards`
- View paginated list (7 cards per page)
- Filter by Account ID or Card Number
- Click "View" to see details
- Click "Update" to edit card

### 2. Search for a Card
- Navigate to `/credit-cards/search`
- Enter Account ID (11 digits) and/or Card Number (16 digits)
- Click "Search"
- View results and take actions

### 3. View Card Details
- From list, click "View" on any card
- See all card information
- Card number and CVV are masked for security
- Click "Edit Card" to update
- Click "Back to List" to return

### 4. Update Card Information
- From detail view, click "Edit Card"
- Or from list, click "Update"
- Modify editable fields:
  - Embossed Name (alphabets and spaces only)
  - Active Status (Y/N)
  - Expiration Month (1-12)
  - Expiration Year (1950-2099)
- Click "Save Changes"
- Confirm in dialog
- System validates and saves

## 🔍 Search & Filter Examples

### Filter by Account ID
```
Account ID: 12345678901
Card Number: (leave empty)
```

### Filter by Card Number
```
Account ID: (leave empty)
Card Number: 1234567890123456
```

### Filter by Both
```
Account ID: 12345678901
Card Number: 1234567890123456
```

## ✅ Validation Rules

### Card Number
- Must be exactly 16 digits
- Numeric only
- Example: `1234567890123456`

### Account ID
- Must be exactly 11 digits
- Numeric only
- Example: `12345678901`

### Embossed Name
- Alphabets and spaces only
- Maximum 50 characters
- Example: `JOHN DOE`

### Active Status
- Must be 'Y' (Active) or 'N' (Inactive)

### Expiration Month
- Must be between 1 and 12
- Example: `12` for December

### Expiration Year
- Must be between 1950 and 2099
- Example: `2025`

## 🎨 UI Components

### Status Badges
- **Green Badge**: Active card
- **Gray Badge**: Inactive card

### Card Number Display
- **List View**: `**** **** **** 1234` (masked)
- **Detail View**: `**** **** **** 1234` (masked)
- **CVV**: Always `***` (masked)

### Buttons
- **Primary**: Main actions (Search, Save)
- **Secondary**: Navigation (Back, Cancel)
- **Small**: Table actions (View, Update)

## 🐛 Troubleshooting

### Issue: "Failed to fetch credit cards"
**Solution**: Check that backend API is running and API_BASE_URL is correct

### Issue: "Invalid card number format"
**Solution**: Ensure card number is exactly 16 digits with no spaces or special characters

### Issue: "Invalid account ID format"
**Solution**: Ensure account ID is exactly 11 digits with no spaces or special characters

### Issue: "Concurrent modification detected"
**Solution**: Another user modified the card. Refresh the page and try again

### Issue: Page not loading
**Solution**: 
1. Check console for errors
2. Verify Node.js version (18+)
3. Clear browser cache
4. Restart development server

## 📊 Sample Data

For testing, you can use these sample values:

### Sample Card 1
```
Card Number: 4532015112830366
Account ID: 12345678901
Embossed Name: JOHN DOE
Active Status: Y
Expiration: 12/2025
```

### Sample Card 2
```
Card Number: 5425233430109903
Account ID: 98765432109
Embossed Name: JANE SMITH
Active Status: Y
Expiration: 06/2026
```

### Sample Card 3
```
Card Number: 2221000000000009
Account ID: 11111111111
Embossed Name: BOB JOHNSON
Active Status: N
Expiration: 03/2024
```

## 🔐 Security Notes

1. **CVV Codes**: Always masked in UI (`***`)
2. **Card Numbers**: Masked except last 4 digits
3. **Authentication**: All API calls include auth headers
4. **Validation**: Both client and server-side validation
5. **Read-Only Fields**: Card number and account ID cannot be changed

## 📝 Development Tips

### Hot Reload
The development server supports hot reload. Changes to files will automatically refresh the browser.

### TypeScript
All files use TypeScript for type safety. Check types in `src/types/creditCard.ts`.

### Styling
Uses TailwindCSS v4. Custom colors defined in `src/app/globals.css`.

### Components
Reusable UI components in `src/components/ui/`:
- Button
- Input
- Select
- Table

## 🧪 Testing

### Manual Testing Checklist
- [ ] List page loads with cards
- [ ] Pagination works (Previous/Next)
- [ ] Filters validate input
- [ ] Search finds correct cards
- [ ] Detail page shows all info
- [ ] Edit page allows updates
- [ ] Confirmation dialog appears
- [ ] Validation prevents invalid data
- [ ] Error messages display correctly
- [ ] Loading states show during operations

### Test Scenarios

#### Scenario 1: View Cards
1. Go to `/credit-cards`
2. Verify cards are displayed
3. Check pagination controls
4. Click "View" on a card
5. Verify details are correct

#### Scenario 2: Filter Cards
1. Go to `/credit-cards`
2. Enter Account ID in filter
3. Click "Search"
4. Verify filtered results
5. Click "Clear Filters"
6. Verify all cards shown again

#### Scenario 3: Update Card
1. Go to `/credit-cards`
2. Click "Update" on a card
3. Change embossed name
4. Click "Save Changes"
5. Confirm in dialog
6. Verify success message
7. Check detail page shows updated name

#### Scenario 4: Search Card
1. Go to `/credit-cards/search`
2. Enter card number
3. Click "Search"
4. Verify card is found
5. Click "View Details"
6. Verify correct card displayed

## 🚢 Production Build

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Set in production environment:
```env
API_BASE_URL=https://api.production.com
NODE_ENV=production
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🆘 Support

For issues or questions:
1. Check the console for error messages
2. Review the CREDIT_CARDS_README.md for detailed documentation
3. Check IMPLEMENTATION_SUMMARY.md for technical details
4. Contact the development team

## 📄 License

Copyright © 2024. All rights reserved.

---

**Happy Coding! 🎉**
