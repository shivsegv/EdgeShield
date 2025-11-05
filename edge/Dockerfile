FROM golang:1.21-alpine

WORKDIR /app

COPY . .

RUN go get -d -v ./...
RUN go build -o /edge-service

EXPOSE 8080

CMD ["/edge-service"]
