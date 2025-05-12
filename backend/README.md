
# Home Maintenance API

This is the FastAPI backend for the Home Maintenance Logbook application. It integrates with Supabase for authentication and database operations.

## Setup Instructions

### Local Development

1. Create a `.env` file by copying the example:
   ```
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key (from Project Settings > API)
   - `JWT_SECRET`: A secure random string for JWT token generation

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn main:app --reload
   ```

### Docker Deployment

1. Create and configure the `.env` file as above

2. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

## API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Integration with Frontend

The frontend should be configured to connect to this API using the base URL `http://localhost:8000` for local development.
