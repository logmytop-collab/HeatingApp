# Use Alpine Linux as the base image (lightweight)
FROM alpine:3.18
 
# Install bash (Alpine uses sh by default; our script uses bash features)
RUN apk add --no-cache bash
 
# Set working directory inside the container
WORKDIR /app
 
# Copy the shell script from host to container
COPY runpinctrl.sh .
 
# Ensure the script is executable (redundant if chmod +x was run on host, but safe)
RUN chmod +x runpinctrl.sh
 
# Optional: Default command (can be overridden by docker-compose)
CMD ["./runpinctrl.sh"]
