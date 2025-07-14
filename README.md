# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your Supabase project:
   - Run the database migration to create the secure_api_keys table:
     - Go to your Supabase project dashboard
     - Navigate to SQL Editor
     - Run the migration file: `supabase/migrations/create_secure_api_keys.sql`
   - Add your Gemini API key to the secure storage:
     - Either use the Admin Panel in the app (if you have admin access)
     - Or run this SQL command in the SQL Editor:
       ```sql
       UPDATE secure_api_keys 
       SET api_key = 'your-actual-gemini-api-key-here' 
       WHERE key_name = 'GEMINI_API_KEY';
       ```
   - Configure admin access:
     - Update the `is_admin` function in the migration to match your admin identification logic
     - By default, users with 'admin' in their email or with role='admin' in user metadata have access
3. Run the app:
   `npm run dev`

## Admin Features

The app includes an admin panel for managing API keys securely:

- **Access**: Users with admin privileges can access the admin panel via the "Admin Panel" button in the header
- **Features**: 
  - View all API keys (with masked values for security)
  - Add new API keys for different services
  - Edit existing API keys and descriptions
  - Toggle API key active/inactive status
  - Delete API keys
- **Security**: All API keys are stored securely in the database with Row Level Security (RLS) policies

## API Key Management

The system supports secure API key storage with the following features:

- Database-stored API keys with encryption at rest
- Row Level Security (RLS) for admin-only access
- Active/inactive status for key rotation
- Fallback to environment variables if database lookup fails
- Audit trail with creation timestamps and user tracking
