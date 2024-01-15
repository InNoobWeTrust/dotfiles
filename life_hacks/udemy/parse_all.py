#!/usr/bin/env python3

# Ref: https://www.machinelearningplus.com/python/parallel-processing-python/
import os
import multiprocessing as mp
from time import sleep

scripts = [s for s in os.listdir() if s.endswith("parser.py")]


# Function to run script with retries
def run_script(script):
    while True:
        try:
            os.system(f"poetry run python {script}")
            break
        except Exception as e:
            print(f"Error running {script}: {e}")
            sleep(30)


if __name__ == "__main__":
    with mp.Pool(mp.cpu_count()) as pool:
        # Run each script in parallel
        pool.map(run_script, scripts)
