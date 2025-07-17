FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 4000

# Set environment variables
ENV FLASK_APP=app.py
ENV PYTHONPATH=/app

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=4000"]