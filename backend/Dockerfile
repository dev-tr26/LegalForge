FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    poppler-utils \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create media directory
RUN mkdir -p media/uploads

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn legal_docs.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120