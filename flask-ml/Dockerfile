# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements file first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the Flask port
EXPOSE 5001

# Environment variable for Flask
ENV FLASK_APP=flask_app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5001

# Run the Flask app (reload made the hotreload available )
CMD ["flask", "run", "--reload"]
