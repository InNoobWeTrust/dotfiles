import os
import configparser

from time import sleep

from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import parser_lib


config = configparser.ConfigParser()
config.read('config.ini')
buffer_size = int(config['courson']['buffer_size'])

results = []
counter = 0
links = []

if os.path.isfile('courson.checkpoint.txt'):
    with open('courson.checkpoint.txt', 'rt') as f:
        counter = int(f.read().strip())

for file_name in ['udemy_learning_courses.txt', 'Udemy4U.txt']:
    if not os.path.isfile(file_name):
        continue
    with open(file_name, 'rt') as f:
        links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = links[counter:]


def checkpoint(count):
    with open('courson.checkpoint.txt', 'wt') as f:
        f.write(str(count))
        f.flush()


if len(links):
    with open('courson.resolved.txt', 'at+') as wf:
        with parser_lib.DriverContext() as driver:
            def resolve_link(link):
                driver.get(link)
                try:
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, 'div.enroll-btn > a'))
                    )
                    a = driver.find_element(By.CSS_SELECTOR, 'div.enroll-btn > a')
                    if len(str(a.get_attribute('href') or "").strip()) > 0:
                        result = a.get_attribute('href')
                        # print('Resolved:', result)
                        return result
                except:
                    pass

            for i in range(len(links) // buffer_size + 1) :
                buffer = list(map(lambda l: l.strip(), links[i * buffer_size : (i + 1) * buffer_size]))
                if len(buffer) == 0:
                    break
                counter += len(buffer)
                print('Resolving:', *buffer, sep='\n')
                resolved_links = map(resolve_link, buffer)
                resolved_links = [link for link in resolved_links if link]
                print('Resolved:', *resolved_links, sep='\n')
                results.extend(resolved_links)
                wf.writelines([line + '\n' for line in resolved_links])
                wf.flush()
                checkpoint(counter)
                print('Processed:', counter)
                sleep(5)


print('Results:', *results, sep='\n')
print('Total processed:', counter)
