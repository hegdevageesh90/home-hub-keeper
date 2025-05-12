
# Home Maintenance API

A production-ready FastAPI backend for the Home Maintenance Logbook application. It integrates with Supabase for authentication and database operations.

## Architecture

This backend follows a modular design with:
- Clear separation of concerns
- Structured error handling
- Comprehensive logging
- Configuration management
- Security best practices

## Setup Instructions

### Local Development

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Docker Development

1. Create and configure the `.env` file as above

2. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Production Deployment

For production deployment, make sure to:

1. Set `ENVIRONMENT=production` in your .env file
2. Use a secure, randomly generated JWT_SECRET
3. Configure proper CORS settings
4. Consider using a reverse proxy like Nginx
5. Set up proper monitoring and alerting

```bash
# Example production Docker run
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## API Documentation

When running in development mode, access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

In production, these interfaces are disabled by default for security.

## Integration with Frontend

The frontend should be configured to connect to this API using the base URL:
- Development: http://localhost:8000
- Production: https://your-api-domain.com

## Performance Optimization

This API implements several performance optimizations:
- Asynchronous request handling
- Proper connection pooling
- Resource cleanup
- Efficient database queries

## Monitoring and Maintenance

Logs are stored in the `/logs` directory with daily rotation. In production, consider
integrating with external logging and monitoring services.
