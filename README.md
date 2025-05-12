
# Home Maintenance Logbook

A digital platform to track home appliances, maintenance records, and schedule reminders for future maintenance.

## Project Structure

- `/src`: Frontend React application
- `/backend`: FastAPI backend application
- `supabase/`: Supabase configuration

## Setup Instructions

### 1. Setup Supabase

This project uses Supabase for authentication, database, and storage. You already have a project set up with the ID: `lkmcjmuyqqydknhfecvj`.

### 2. Frontend Setup

1. Create a `.env` file by copying the example:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a `.env` file by copying the example:
   ```
   cp .env.example .env
   ```

3. Update your `.env` with your Supabase service role key from:
   https://supabase.com/dashboard/project/lkmcjmuyqqydknhfecvj/settings/api

4. Install dependencies and start the server:
   ```
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   Alternatively, use Docker:
   ```
   docker-compose up -d
   ```

## Deployment Instructions

### Frontend Deployment

You can deploy the frontend to platforms like Vercel, Netlify, or any static hosting service.

1. Build the frontend:
   ```
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service.

### Backend Deployment

The backend can be deployed to cloud services like AWS, Google Cloud, or Heroku.

#### Docker Deployment

1. Build and push the Docker image:
   ```
   docker build -t maintenance-api ./backend
   ```

2. Run on your server:
   ```
   docker run -p 8000:8000 --env-file ./backend/.env maintenance-api
   ```

#### Cloud Deployment

For AWS Elastic Beanstalk:
1. Install the EB CLI
2. Navigate to the backend folder
3. Run `eb init` and follow the prompts
4. Run `eb create` to create an environment
5. Configure environment variables in the AWS console

## API Documentation

Access the API documentation at:
- When running locally: http://localhost:8000/docs
- When deployed: https://your-domain.com/docs

## Architecture

This application uses:
- React + Vite for the frontend
- FastAPI for the backend API
- Supabase for authentication and database
- Tailwind CSS for styling
