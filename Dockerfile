# Use an official Python runtime as a parent image
#FROM mysql:8.0
FROM node

# Install any needed packages specified in requirements.txt
RUN npm install

# Make port 80 available to the world outside this container
#EXPOSE 80

# Define environment variable
#ENV NAME World

# Run app.py when the container launches
#CMD ["python", "app.py"]
CMD node index.js