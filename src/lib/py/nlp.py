
import re
from transformers import pipeline
import os
import sys

# Setting to use the 0th GPU
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

#  Setting to use the bart-large-cnn model for summarization
summarizer = pipeline("summarization",model="sshleifer/distilbart-cnn-12-6")

import requests

url = sys.argv[1]

r = requests.get(url)
# print(r.text)

# Checks if request actualy worked
if(r.status_code == 200):
    # Pre-parsing 
    words = len(r.text.split())
    parsed = re.sub(r'[^A-Za-z0-9]+\s+[~%&\\;:`,<>?#\s]', '', r.text)
    # Runs summeriser
    summary_text = summarizer(parsed[:4000], max_length=1024, min_length=100, do_sample=False)[0]['summary_text']
    print(summary_text)
else:
    print('false')

# Clears stdout for so buffers dont merge
sys.stdout.flush()