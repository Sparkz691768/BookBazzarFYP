# BookBazzar - Final Year Project

## Project Overview
BookBazzar is an online bookstore platform built for my Final Year Project. It allows users to browse books, add them to a cart, and make purchases. Users can also list their own books for sale.

The project features a full authentication system, an admin dashboard for managing users and books, and a secure payment gateway integration.

## Technologies Used
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: ASP.NET Core Web API
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Authentication**: JWT with ASP.NET Identity

## How to Run the Project

### Prerequisites
- Node.js installed
- .NET 8 SDK
- PostgreSQL database

### 1. Setup Backend
1. Go to the `server` folder.
2. Update `appsettings.json` with your database connection string and Cloudinary keys.
3. Run `dotnet ef database update` to setup the database.
4. Run `dotnet run` to start the API.

### 2. Setup Frontend
1. Go to the `client` folder.
2. Run `npm install` to install packages.
3. Create a `.env` file based on `.env.example` and add your API URL.
4. Run `npm run dev` to start the website.

### 3. Usage
- Open `http://localhost:3000` in your browser.
- You can register as a new user or login.

## Contributors
- Binaya Kharel
