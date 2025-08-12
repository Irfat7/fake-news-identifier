FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 5001

ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]