# Credit Card Management API - OpenAPI Summary

## Overview
This API provides endpoints for managing credit cards, including viewing details, updating information, and listing cards with pagination and filtering capabilities.

## Base URL
```
/api/credit-cards
```

## Endpoints

### 1. Get Card Details by Card Number
**Endpoint:** `GET /api/credit-cards/{cardNumber}`

**Description:** Retrieves detailed information about a specific credit card using its card number.

**Path Parameters:**
- `cardNumber` (string, required): 16-digit credit card number

**Response:** `200 OK`
```json
{
  "cardNumber": "string (16 digits)",
  "accountId": "number (11 digits)",
  "embossedName": "string (max 50 characters)",
  "cvvCode": "string (3 digits)",
  "expirationDate": "string (YYYY-MM-DD)",
  "activeStatus": "string (Y or N)"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid card number format
- `404 Not Found`: Credit card not found

---

### 2. Search Credit Card
**Endpoint:** `GET /api/credit-cards/search`

**Description:** Searches for a credit card using account ID and/or card number. At least one search criterion must be provided.

**Query Parameters:**
- `accountId` (number, optional): 11-digit account identifier
- `cardNumber` (string, optional): 16-digit credit card number

**Response:** `200 OK`
```json
{
  "cardNumber": "string (16 digits)",
  "accountId": "number (11 digits)",
  "embossedName": "string (max 50 characters)",
  "cvvCode": "string (3 digits)",
  "expirationDate": "string (YYYY-MM-DD)",
  "activeStatus": "string (Y or N)"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid search criteria or no criteria provided
- `404 Not Found`: No credit card found matching the criteria

---

### 3. Update Credit Card
**Endpoint:** `PUT /api/credit-cards/{cardNumber}`

**Description:** Updates credit card information including embossed name, active status, and expiration date. Validates input and checks for concurrent modifications.

**Path Parameters:**
- `cardNumber` (string, required): 16-digit credit card number

**Request Body:**
```json
{
  "cardNumber": "string (16 digits, required)",
  "accountId": "number (11 digits, required)",
  "embossedName": "string (max 50 characters, alphabets and spaces only, required)",
  "activeStatus": "string (Y or N, required)",
  "expirationMonth": "number (1-12, required)",
  "expirationYear": "number (1950-2099, required)"
}
```

**Validation Rules:**
- `embossedName`: Must contain only alphabets and spaces
- `activeStatus`: Must be 'Y' (active) or 'N' (inactive)
- `expirationMonth`: Must be between 1 and 12
- `expirationYear`: Must be between 1950 and 2099
- `cardNumber` in path must match `cardNumber` in request body

**Response:** `200 OK`
```json
{
  "cardNumber": "string (16 digits)",
  "accountId": "number (11 digits)",
  "embossedName": "string (max 50 characters)",
  "cvvCode": "string (3 digits)",
  "expirationDate": "string (YYYY-MM-DD)",
  "activeStatus": "string (Y or N)"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or card number mismatch
- `404 Not Found`: Credit card not found
- `409 Conflict`: Card was modified by another user (concurrent modification)

---

### 4. List Credit Cards
**Endpoint:** `GET /api/credit-cards`

**Description:** Retrieves a paginated list of credit cards with optional filtering by account ID and/or card number. Returns up to 7 records per page.

**Query Parameters:**
- `accountId` (number, optional): Filter by 11-digit account identifier
- `cardNumber` (string, optional): Filter by 16-digit credit card number
- `page` (number, optional, default: 1): Page number (minimum: 1)

**Response:** `200 OK`
```json
{
  "cards": [
    {
      "cardNumber": "string (16 digits)",
      "accountId": "number (11 digits)",
      "activeStatus": "string (Y or N)"
    }
  ],
  "currentPage": "number",
  "hasNextPage": "boolean",
  "hasPreviousPage": "boolean",
  "totalRecordsOnPage": "number"
}
```

**Pagination Details:**
- Maximum 7 records per page
- `hasNextPage`: Indicates if more pages are available
- `hasPreviousPage`: Indicates if previous pages exist
- `currentPage`: Current page number (1-indexed)

**Error Responses:**
- `400 Bad Request`: Invalid query parameters

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "status": "number (HTTP status code)",
  "message": "string (error description)",
  "timestamp": "string (ISO 8601 datetime)"
}
```

For validation errors (400 Bad Request):
```json
{
  "status": 400,
  "errors": {
    "fieldName": "error message"
  },
  "timestamp": "string (ISO 8601 datetime)"
}
```

## Business Rules Summary

### Credit Card Update Rules:
1. Card name must contain only alphabets and spaces
2. Card status must be 'Y' (active) or 'N' (inactive)
3. Expiration month must be between 1 and 12
4. Expiration year must be between 1950 and 2099
5. Account ID cannot be changed during update
6. System checks for concurrent modifications before updating
7. Card name is automatically converted to uppercase

### Search and List Rules:
1. At least one search criterion required for search endpoint
2. List endpoint supports filtering by account ID and/or card number
3. Pagination limited to 7 records per page
4. Results ordered by card number in ascending order

### Data Validation:
1. Card number must be exactly 16 digits
2. Account ID must be exactly 11 digits
3. CVV code must be exactly 3 digits
4. All mandatory fields must be provided

## Security Considerations
- Sensitive data like CVV codes should be handled securely
- Consider implementing authentication and authorization
- Implement rate limiting for API endpoints
- Log all update operations for audit purposes
