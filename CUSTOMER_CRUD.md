# Customer CRUD Operations

This document outlines the complete CRUD (Create, Read, Update, Delete) operations for customers in the AI-Powered Small Business Suite.

## Overview

The customer management system provides full CRUD functionality with:
- Authentication using NextAuth
- Database operations using Prisma
- Type-safe API endpoints
- React components with form validation
- Error handling and user feedback

## API Endpoints

### GET /api/customers
- **Description**: Fetch all customers for the authenticated user
- **Authentication**: Required
- **Response**: Array of customer objects

### POST /api/customers
- **Description**: Create a new customer
- **Authentication**: Required
- **Body**: CustomerFormData object
- **Response**: Created customer object

### GET /api/customers/[id]
- **Description**: Fetch a single customer by ID
- **Authentication**: Required
- **Response**: Customer object

### PUT /api/customers/[id]
- **Description**: Update an existing customer
- **Authentication**: Required
- **Body**: CustomerFormData object
- **Response**: Updated customer object

### DELETE /api/customers/[id]
- **Description**: Delete a customer
- **Authentication**: Required
- **Response**: Success message
- **Note**: Prevents deletion if customer has invoices

## Data Types

### Customer
```typescript
interface Customer {
    id: string
    userId: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}
```

### CustomerFormData
```typescript
interface CustomerFormData {
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
}
```

## Service Functions

Located in `/lib/customers.ts`:

- `getCustomers()`: Fetch all customers
- `addCustomer(data)`: Create a new customer
- `updateCustomer(id, data)`: Update a customer
- `deleteCustomer(id)`: Delete a customer
- `getCustomer(id)`: Fetch a single customer

## Frontend Components

### CustomerPage
- Main page component at `/app/customers/page.tsx`
- Handles state management and API calls
- Includes search and filtering functionality

### Form Modals
Located in `/components/customers/form-modal.tsx`:

- `AddCustomerModal`: For creating new customers
- `EditCustomerModal`: For updating existing customers  
- `DeleteCustomerModal`: For deleting customers with confirmation

## Error Handling

The system includes comprehensive error handling:

- API-level validation and error responses
- Form validation using Zod
- User feedback with toast notifications
- Loading states in modals
- Proper error boundaries

## Security Features

- User authentication required for all operations
- Customers are scoped to the authenticated user
- Email uniqueness enforced per user
- Protection against unauthorized access
- SQL injection prevention through Prisma

## Database Schema

The Customer model in Prisma:

```prisma
model Customer {
    id        String    @id @default(cuid())
    userId    String
    user      User      @relation("UserCustomers", fields: [userId], references: [id], onDelete: Cascade)
    name      String
    email     String?
    phone     String?
    address   String?
    notes     String?
    invoices  Invoice[] @relation("CustomerInvoices")
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt

    @@unique([userId, email])
    @@index([userId])
}
```

## Setup Instructions

1. **Environment Variables**: Copy `.env.example` to `.env` and configure:
   ```
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Database Setup**: Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Authentication**: Ensure NextAuth is properly configured with user registration

4. **Start Development**: Run the development server:
   ```bash
   npm run dev
   ```

## Usage Examples

### Adding a Customer
1. Navigate to `/customers`
2. Click "Add Customer" button
3. Fill in the form (name is required)
4. Submit to create the customer

### Editing a Customer
1. Find the customer in the table
2. Click the "Edit" button in the Actions column
3. Update the desired fields
4. Submit to save changes

### Deleting a Customer
1. Find the customer in the table
2. Click the "Delete" button in the Actions column
3. Confirm the deletion in the dialog
4. Customer will be removed (unless they have invoices)

## Testing

To test the CRUD operations:

1. Ensure you have a user account registered
2. Sign in to the application
3. Navigate to the customers page
4. Test each CRUD operation:
   - Create: Add a new customer
   - Read: View customers in the table
   - Update: Edit an existing customer
   - Delete: Remove a customer (create one without invoices first)

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure NextAuth is properly configured and user is signed in
2. **Database errors**: Check DATABASE_URL and ensure Prisma is generated
3. **Validation errors**: Ensure required fields (name) are provided
4. **Delete errors**: Check if customer has associated invoices

### Error Messages

- "Unauthorized": User not signed in or session expired
- "Customer not found": Customer doesn't exist or doesn't belong to user
- "A customer with this email already exists": Email uniqueness constraint
- "Cannot delete customer with existing invoices": Delete constraint protection