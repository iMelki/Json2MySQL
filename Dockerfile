# Use an official Python runtime as a parent image
#FROM mysql:8.0
FROM node

# Create app directory
RUN mkdir -p /src/app
WORKDIR /src/app

# Install any needed packages specified in requirements.txt
COPY package.json /src/app/
RUN npm install

# Bundle app source
COPY . /src/app

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
#ENV NAME World

# Run app.py when the container launches
#CMD ["python", "app.py"]
#CMD ["node", "index.js"]
#CMD ["npm", "run", "start"]
CMD ["npm", "run", "debug"]