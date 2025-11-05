import requests, time, threading
import argparse

def worker(url, api_key, rps, duration):
    interval = 1.0 / rps
    end = time.time() + duration
    count = 0
    while time.time() < end:
        try:
            headers = {}
            if api_key:
                headers["X-API-KEY"] = api_key
            r = requests.get(url, headers=headers, timeout=1)
            if r.status_code == 200:
                count += 1
        except Exception as e:
            print("err", e)
        time.sleep(interval)
    print(f"Worker finished. Successful requests: {count}")

def main():
    parser = argparse.ArgumentParser(description="Attack simulator for edge rate limiter.")
    parser.add_argument("--url", type=str, default="http://localhost:8080/api/hello", help="Target URL")
    parser.add_argument("--rps", type=int, default=100, help="Requests per second per thread")
    parser.add_argument("--duration", type=int, default=10, help="Duration of the attack in seconds")
    parser.add_argument("--api-key", type=str, default="", help="API Key to use")
    parser.add_argument("--threads", type=int, default=1, help="Number of concurrent threads")

    args = parser.parse_args()

    print(f"Starting attack on {args.url} with {args.threads} threads, {args.rps} RPS/thread for {args.duration} seconds...")
    threads = []
    for _ in range(args.threads):
        thread = threading.Thread(target=worker, args=(args.url, args.api_key, args.rps, args.duration))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()
    print("Attack finished.")

if __name__ == "__main__":
    main()
