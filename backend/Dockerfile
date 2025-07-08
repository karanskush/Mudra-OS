# Use the official Go image as the base image
FROM golang:1.23-alpine

# Set the working directory
WORKDIR /app

# Copy the go.mod and go.sum files from the backend subdirectory
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy the backend source code into the current directory
COPY backend/ .

# Build the application
RUN go build -o main .

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["./main"] 