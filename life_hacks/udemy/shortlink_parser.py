import os
import configparser

from time import sleep

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import parser_lib


script_name = os.path.basename(__file__)
config = configparser.ConfigParser()
config.read("config.ini")
buffer_size = int(config["courson"]["buffer_size"])

results = []
counter = 0
links = []

if os.path.isfile("bitly.checkpoint.txt"):
    with open("bitly.checkpoint.txt", "rt") as f:
        counter = int(f.read().strip())

for file_name in ["udemy2020.txt"]:
    if not os.path.isfile(file_name):
        continue
    with open(file_name, "rt") as f:
        links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = links[counter:]


def checkpoint(count):
    with open("bitly.checkpoint.txt", "wt") as f:
        f.write(str(count))
        f.flush()


if len(links):
    with open("bitly.resolved.txt", "at+") as wf:
        with parser_lib.DriverContext() as driver:

            def resolve_link(link):
                driver.get(link)
                try:
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.ID, "udemy"))
                    )
                    return driver.current_url
                except:
                    pass

            for i in range(len(links) // buffer_size + 1):
                buffer = list(
                    map(
                        lambda l: l.strip(),
                        links[i * buffer_size : (i + 1) * buffer_size],
                    )
                )
                if len(buffer) == 0:
                    break
                counter += len(buffer)
                print(f"[{script_name}] Resolving:", *buffer, sep="\n")
                resolved_links = map(resolve_link, buffer)
                resolved_links = [link for link in resolved_links if link]
                print(f"[{script_name}] Resolved:", *resolved_links, sep="\n")
                results.extend(resolved_links)
                wf.writelines([line + "\n" for line in resolved_links])
                wf.flush()
                checkpoint(counter)
                print(f"[{script_name}] Processed:", counter)
                sleep(5)


print(f"[{script_name}] Results:", *results, sep="\n")
print(f"[{script_name}] Total processed:", counter)
