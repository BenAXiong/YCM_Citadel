import os
import json
import time
import requests
from typing import Dict, List
import threading
from concurrent.futures import ThreadPoolExecutor

def annex_audio(data_dir: str):
    distilled_file = os.path.join(data_dir, "distilled", "sentences.jsonl")
    audio_dir = os.path.join(data_dir, "audio")
    
    print("--- COMMENCING FULL AUDIO ANNEXATION ---")
    print(f"Targeting: {audio_dir}")
    
    # Pre-scan for unique URLs
    urls_to_harvest = {}
    total_records = 0
    malformed = 0
    with open(distilled_file, "r", encoding="utf-8") as f:
        for line in f:
            total_records += 1
            try:
                r = json.loads(line)
                url = r["audio"]["url"]
                path = r["audio"]["local_path"]
                if url and path and not os.path.exists(os.path.join(data_dir, path)):
                    urls_to_harvest[url] = path
            except: 
                malformed += 1
                continue

    print(f"Found {total_records} records ({malformed} malformed skipped).")
    print(f"Unique new URLs to annex: {len(urls_to_harvest)}")
    
    # Download worker
    def download_one(url, relative_path):
        abs_path = os.path.join(data_dir, relative_path)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200:
                with open(abs_path, "wb") as f:
                    f.write(r.content)
                return len(r.content)
        except: pass
        return 0

    # Multi-threaded download
    start_time = time.time()
    total_downloaded = 0
    bytes_annexed = 0
    
    print(f"Executing with 16 threads of sovereignty...")
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(download_one, url, path): (url, path) for url, path in urls_to_harvest.items()}
        
        for future in futures:
            size = future.result()
            if size > 0:
                total_downloaded += 1
                bytes_annexed += size
                
            if total_downloaded % 100 == 0:
                elapsed = time.time() - start_time
                mb = bytes_annexed / (1024 * 1024)
                print(f"  [Annex Progress] {total_downloaded}/{len(urls_to_harvest)} files | {mb:.1f} MB | {mb/max(1,elapsed)*60:.1f} MB/min")

    duration = time.time() - start_time
    print("-" * 30)
    print("--- ANNEXATION COMPLETE ---")
    print(f"Total Annexed: {total_downloaded} files")
    print(f"Total Data:    {bytes_annexed / (1024*1024):.2f} MB")
    print(f"Total Time:    {duration/60:.1f} minutes")

if __name__ == "__main__":
    base_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    annex_audio(base_data)
