import os
import json
import time
import requests
import subprocess
from typing import List, Dict

def run_audio_test():
    # 1. Scope: Nine-Year Curriculum, South Amis (ID: 1), Level 1, Lessons 1-10
    # Estimate: ~10 sentences per lesson, 10 lessons = 100 sentences.
    # File size estimate: ~30KB per MP3 clip.
    # TOTAL ESTIMATE: 100 * 30KB = 3.0 MB.
    # TIME ESTIMATE: 100 files * 0.2s overhead + download time = ~30 seconds.
    
    dialect_id = 1
    levels = [1]
    classes = range(1, 11)
    
    print("--- AUDIO HARVEST SAMPLE TEST ---")
    print(f"Scope: South Amis (ID {dialect_id}), Level 1, Classes 1-10")
    print("Pre-calculated Estimate: 3.0 MB / ~100 files / ~30 seconds")
    print("-" * 30)
    
    test_dir = "data/audio_test"
    os.makedirs(test_dir, exist_ok=True)
    
    total_files = 0
    total_bytes = 0
    start_time = time.time()
    
    # We fetch labels first to find the audio IDs
    for c in classes:
        print(f"  Probing Level 1 Class {c}...")
        url = f"https://web.klokah.tw/nine/php/getText.php?d={dialect_id}&l=1&c={c}"
        try:
            r = requests.get(url, timeout=10)
            # Find order tags <order>1</order>
            import re
            orders = re.findall(r"<order>(\d+)</order>", r.text)
            
            for o in orders:
                # Audio URL pattern: https://klokah.tw/nine/sound/{d}/{l}/{c}/{o}.mp3
                audio_url = f"https://klokah.tw/nine/sound/{dialect_id}/1/{c}/{o}.mp3"
                local_path = os.path.join(test_dir, f"1_1_{c}_{o}.mp3")
                
                # ACTUAL DOWNLOAD
                audio_r = requests.get(audio_url, timeout=10)
                if audio_r.status_code == 200:
                    with open(local_path, "wb") as f:
                        f.write(audio_r.content)
                    total_files += 1
                    total_bytes += len(audio_r.content)
                
                time.sleep(0.05) # Polite delay
        except Exception as e:
            print(f"    Error: {e}")
            
    end_time = time.time()
    duration = end_time - start_time
    total_mb = total_bytes / (1024 * 1024)
    
    print("-" * 30)
    print("--- TEST RESULTS ---")
    print(f"Actual Files:   {total_files}")
    print(f"Actual Size:    {total_mb:.2f} MB")
    print(f"Actual Time:    {duration:.1f} seconds")
    print(f"Avg Size/File:  {total_bytes/max(1,total_files)/1024:.1f} KB")
    print(f"Capture Rate:   {total_mb/max(1,duration)*60:.1f} MB/min")
    
    if total_mb > 0:
        print("\nConclusion: The pipeline is healthy. Proceed with full annexation?")

if __name__ == "__main__":
    run_audio_test()
