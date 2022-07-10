# service/registry.dockerfile
# Dockerfile to build and run an image for the registry.

# Use the official Node 18 image.
FROM node:18
# Install pnpm.
RUN npm install -g pnpm

# Create and change to the app directory.
WORKDIR /usr/src/app
# Copy over the code to the app directory.
COPY ./modules/registry/. ./
# Install all dependencies (including development dependencies).
RUN pnpm install

# Run the server on container startup.
EXPOSE 9267
CMD ["pnpm", "start"]
