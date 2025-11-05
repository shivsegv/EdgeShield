FROM python:3.11-slim-bullseye
WORKDIR /app
COPY requirements.txt ./
RUN apt-get update && apt-get install -y postgresql-client
# RUN apt-get update && apt-get install -y curl
# RUN curl -LsSf https://astral.sh/uv/install.sh | sh
# RUN /root/.cargo/bin/uv pip install --system -r requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY wait-for-postgres.sh .
EXPOSE 8081
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]