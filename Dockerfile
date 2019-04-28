# Use an official node version as a parent image
FROM node:11.12.0

# Create app directory
RUN mkdir -p /src/app
WORKDIR /src/app

# Install any needed packages specified in requirements.txt
COPY package.json /src/app/
RUN npm install

# Bundle app source
COPY . /src/app

# Make port 8000 available to the world outside this container
EXPOSE 3000

# Define environment variable
#ENV DEBUG True

VOLUME ["/var/lib/docker/volumes/jtmVol"]

# Run
#CMD ["node", "index.js"]
#CMD ["npm", "run", "start"]
CMD ["npm", "run", "debug"]
#CMD ["npm", "run", "server"]
