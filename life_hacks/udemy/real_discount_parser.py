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
buffer_size = int(config["real_discount"]["buffer_size"])

results = []
counter = 0
links = []

if os.path.isfile("real_discount.checkpoint.txt"):
    with open("real_discount.checkpoint.txt", "rt") as f:
        counter = int(f.read().strip())

for file_name in ["freeprogrammingcourses.txt", "real_discount.txt"]:
    if not os.path.isfile(file_name):
        continue
    with open(file_name, "rt") as f:
        links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = links[counter:]


def checkpoint(count):
    with open("real_discount.checkpoint.txt", "wt") as f:
        f.write(str(count))
        f.flush()


if len(links):
    with open("real_discount.resolved.txt", "at+") as wf:
        with parser_lib.DriverContext() as driver:

            def resolve_link(link):
                driver.get(link)
                try:
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located(
                            (By.CSS_SELECTOR, ".card.widget-card.text-center")
                        )
                    )
                    inner_a = driver.find_element(
                        By.CSS_SELECTOR, ".card.widget-card.text-center"
                    )
                    a = driver.execute_script(
                        "return arguments[0].parentNode;", inner_a
                    )
                    if len(str(a.get_attribute("href") or "").strip()) > 0:
                        result = a.get_attribute("href").removeprefix(
                            "https://click.linksynergy.com/deeplink?id=bnwWbXPyqPU&mid=47901&murl="
                        )
                        # print(f"[{script_name}] Resolved:", result)
                        return result
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
