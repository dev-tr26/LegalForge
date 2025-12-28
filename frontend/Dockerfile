FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --silent

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]

# For production build, use:
# RUN npm run build
# CMD ["npx", "serve", "-s", "build", "-l", "3000"]