import urllib.request
import ssl

def test_screener():
    url = "https://www.screener.in/company/HUDCO/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        # Create unverified context if needed, but check standard first
        response = urllib.request.urlopen(req, timeout=10)
        html = response.read().decode('utf-8')
        print(f"Success! Status: {response.status}, HTML Length: {len(html)}")
    except Exception as e:
        print(f"Error fetching with urllib: {e}")

if __name__ == "__main__":
    test_screener()
