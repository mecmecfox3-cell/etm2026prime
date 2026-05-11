import cv2
import numpy as np
import pytesseract
import re
import os
import sys
import time
import json

# =============================================================================
# ETM Video Analyzer — Automatic Timestamp Extraction
# =============================================================================
# Requirements:
# pip install opencv-python pytesseract numpy
#
# Also requires Tesseract OCR engine installed:
# - Windows: https://github.com/UB-Mannheim/tesseract/wiki
# - Mac: brew install tesseract
# =============================================================================

# --- Tesseract Path Setup (Windows) ---
# Update this to your Tesseract installation path if it's not in your system PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- Configuration ---
VIDEO_FILES = [
    "video.mp4", "video2.mp4", "video3.mp4", 
    "video4.mp4", "video5.mp4", "video6.mp4"
]

FRAMES_PER_SECOND = 2  # Process 2 frames per second for speed

# --- Region of Interest (ROI) Configuration ---
# Coordinates are ratios (0.0 to 1.0) of the video width/height.
# This makes the script resolution-independent.

# ROI for detecting the Question Number (Rule 1)
# Adjust these based on where the question number appears in your final videos.
# In some videos it's top-left, in others it's bottom-left.
OCR_ROI = {
    "x1": 0.00,  # Left edge
    "y1": 0.60,  # Top edge (60% down)
    "x2": 0.85,  # Right edge
    "y2": 0.85   # Bottom edge
}

# ROI for detecting the Green correct answer highlight (Rule 2)
# Should cover the area where the answer options (A/B/C/D) and the checkmark appear.
GREEN_ROI = {
    "x1": 0.00,  # Left edge
    "y1": 0.65,  # Top edge
    "x2": 1.00,  # Right edge
    "y2": 0.95   # Bottom edge
}

# --- Green Color HSV Bounds ---
# Adjust these if the green shade differs.
# Values are for OpenCV HSV: H(0-179), S(0-255), V(0-255)
# If your "green" checkmark is actually grey/white (as in some test videos), 
# you might need to adjust this to detect white/grey instead, or use a wider green range.
GREEN_HSV_LOWER = np.array([35, 80, 80])
GREEN_HSV_UPPER = np.array([85, 255, 255])

# Threshold: what percentage of pixels in GREEN_ROI must be green to trigger expStart?
GREEN_PIXEL_THRESHOLD = 0.001  # 0.1% of the ROI area

TOTAL_QUESTIONS = 40

def get_roi_coords(frame, roi_dict):
    h, w = frame.shape[:2]
    return (
        int(w * roi_dict["x1"]),
        int(h * roi_dict["y1"]),
        int(w * roi_dict["x2"]),
        int(h * roi_dict["y2"])
    )

def extract_question_number(frame):
    """Rule 1: Use OCR to detect question number appearance."""
    x1, y1, x2, y2 = get_roi_coords(frame, OCR_ROI)
    roi = frame[y1:y2, x1:x2]
    
    # Pre-process for OCR (resize up, grayscale, threshold)
    roi = cv2.resize(roi, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    detected_num = None
    
    # Try generic digits mode first
    try:
        text = pytesseract.image_to_string(
            thresh, config='--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789 '
        ).strip()
        if text:
            # Find any valid number 1-40
            nums = re.findall(r'\b([1-9]|[1-3][0-9]|40)\b', text)
            if nums:
                detected_num = int(nums[0])
    except:
        pass
        
    return detected_num

def detect_green(frame):
    """Rule 2: Detect green highlight indicating explanation start."""
    x1, y1, x2, y2 = get_roi_coords(frame, GREEN_ROI)
    roi = frame[y1:y2, x1:x2]
    
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, GREEN_HSV_LOWER, GREEN_HSV_UPPER)
    
    total_pixels = mask.shape[0] * mask.shape[1]
    green_pixels = cv2.countNonZero(mask)
    ratio = green_pixels / total_pixels if total_pixels > 0 else 0
    
    return ratio >= GREEN_PIXEL_THRESHOLD

def analyze_video(video_path, serie_id):
    if not os.path.exists(video_path):
        print(f"Warning: {video_path} not found. Skipping.")
        return None
        
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    frame_interval = int(max(1, fps / FRAMES_PER_SECOND))
    
    print(f"\nAnalyzing {video_path} (Serie {serie_id})...")
    print(f"Duration: {duration:.1f}s | FPS: {fps:.1f} | Scanning {FRAMES_PER_SECOND} frames/sec")
    
    # State tracking
    current_q = 0
    q_data = {}  # Format: { q_num: {"qStart": x, "expStart": y, "expEnd": z} }
    
    frame_idx = 0
    start_t = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx % frame_interval != 0:
            frame_idx += 1
            continue
            
        current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
        
        # --- Print progress ---
        if frame_idx % (frame_interval * 10) == 0:
            pct = (frame_idx / total_frames) * 100
            sys.stdout.write(f"\r  Progress: {pct:5.1f}% | Time: {current_time:6.1f}s | Current Q: {current_q}")
            sys.stdout.flush()
            
        # --- Rule 1: Question Number Detection ---
        # Only check OCR if we're expecting a new question
        if current_q < TOTAL_QUESTIONS and (current_q == 0 or (current_q in q_data and q_data[current_q].get("expStart") is not None)):
            detected_q = extract_question_number(frame)
            
            if detected_q and detected_q > current_q and detected_q <= current_q + 2:
                # New question detected!
                if current_q > 0 and current_q in q_data:
                    # Set expEnd of previous question
                    q_data[current_q]["expEnd"] = round(current_time - 2.0, 1)
                
                current_q = detected_q
                q_data[current_q] = {
                    "qStart": round(current_time, 1),
                    "expStart": None,
                    "expEnd": None
                }
                print(f"\n  [OK] Detected Q{current_q} at {current_time:.1f}s")
                
        # --- Rule 2: Explanation Start Detection ---
        if current_q > 0 and q_data[current_q]["expStart"] is None:
            if detect_green(frame):
                exp_start_time = max(0, round(current_time - 2.0, 1))
                q_data[current_q]["expStart"] = exp_start_time
                print(f"\n  [OK] Detected Explanation for Q{current_q} at {current_time:.1f}s (expStart set to {exp_start_time:.1f}s)")
                
        frame_idx += 1
        
    # Finalize last question's expEnd
    if current_q > 0 and current_q in q_data and q_data[current_q]["expEnd"] is None:
        q_data[current_q]["expEnd"] = round(duration, 1)
        
    cap.release()
    print(f"\nCompleted {video_path} in {time.time() - start_t:.1f}s")
    
    # Format the data into the JS array structure
    js_arrays = []
    for i in range(1, TOTAL_QUESTIONS + 1):
        if i in q_data:
            d = q_data[i]
            # Since we don't know the exact answer string (A, B, C, D) from this script, 
            # we provide the timestamp triplet, and add a placeholder 'X' for the answer.
            qS = d['qStart'] if d['qStart'] is not None else 0
            eS = d['expStart'] if d['expStart'] is not None else 0
            eE = d['expEnd'] if d['expEnd'] is not None else 0
            js_arrays.append(f"[{qS}, {eS}, {eE}]")
        else:
            js_arrays.append("[0, 0, 0]")
            
    return js_arrays

def main():
    print("Starting Video Analysis...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    all_series_data = {}
    
    for i, video_file in enumerate(VIDEO_FILES):
        serie_id = i + 1
        video_path = os.path.join(script_dir, video_file)
        
        js_arrays = analyze_video(video_path, serie_id)
        if js_arrays:
            all_series_data[serie_id] = js_arrays
            
    # --- Output Final JavaScript ---
    print("\n" + "="*80)
    print("FINAL JAVASCRIPT OUTPUT")
    print("="*80)
    
    for serie_id, arrays in all_series_data.items():
        print(f"\n  serie{serie_id}: {{")
        print(f"    title: \"Série {serie_id}\", videoFile: \"{VIDEO_FILES[serie_id-1]}\",")
        print("    questions: [")
        
        # Print in groups of 5 for readability
        for i in range(0, len(arrays), 5):
            chunk = arrays[i:i+5]
            line = "      " + ", ".join(chunk)
            if i + 5 < len(arrays):
                line += ","
            print(line)
            
        print("    ]")
        print("  },")

if __name__ == "__main__":
    main()
