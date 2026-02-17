# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐

This is the easiest option and doesn't require local installation.

### Steps:

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a new cluster** (Free tier M0 is perfect for development)

3. **Create a database user**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)

4. **Whitelist your IP**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP

5. **Get your connection string**:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `timesplit` or keep the default

6. **Update your `.env` file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/timesplit?retryWrites=true&w=majority
   ```

## Option 2: Install MongoDB Locally (macOS)

### Using Homebrew:

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongosh
```

Your `.env` file should already be configured:
```env
MONGODB_URI=mongodb://localhost:27017/timesplit
```

### Manual Start (if service doesn't work):

```bash
# Create data directory
mkdir -p ~/data/db

# Start MongoDB manually
mongod --dbpath ~/data/db
```

## Option 3: Using Docker

If you have Docker installed:

```bash
# Run MongoDB in a Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Verify it's running
docker ps
```

Your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/timesplit
```

## Verify Connection

After setting up MongoDB, restart your backend server:

```bash
cd TimeSplit/backend
npm run dev
```

You should see:
```
MongoDB Connected: ...
```

## Troubleshooting

### Error: ECONNREFUSED
- MongoDB is not running
- Check if MongoDB service is started: `brew services list` (macOS)
- Or check Docker container: `docker ps`

### Error: Authentication failed
- Check your MongoDB Atlas username/password
- Verify IP is whitelisted in Atlas

### Error: Network timeout
- Check your internet connection (for Atlas)
- Verify connection string is correct

## Quick Start (Recommended)

For fastest setup, use **MongoDB Atlas**:
1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Get connection string
4. Update `.env` file
5. Restart server

That's it! 🎉
