import os
import csv

RAW_CSV_PATH = os.path.join(os.path.dirname(__file__), "raw_schemes.csv")

# We can also populate directly using cleaner.py if we have raw CSV or dataset array.
print(f"Dataset populator initialized at {RAW_CSV_PATH}")
