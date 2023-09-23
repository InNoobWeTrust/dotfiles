import os
import configparser

from time import sleep

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

options = webdriver.FirefoxOptions()
options.add_argument('--headless')
driver = None

config = configparser.ConfigParser()
config.read('config.ini')
buffer_size = int(config['real_discount']['buffer_size'])

results = []
counter = 0
if os.path.isfile('real_discount.checkpoint.txt'):
    with open('real_discount.checkpoint.txt', 'rt') as f:
        counter = int(f.read().strip())

def checkpoint(count):
    with open('real_discount.checkpoint.txt', 'wt') as f:
        f.write(str(count))
        f.flush()

links = []
for file_name in ['freeprogrammingcourses.txt', 'real_discount.txt']:
    if not os.path.isfile(file_name):
        continue
    with open(file_name, 'rt') as f:
        links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = links[counter:]

with open('real_discount.resolved.txt', 'at+') as wf:

    def resolve_link(link):
        global driver
        if not driver:
            driver = webdriver.Firefox(
               options=options
            )

        driver.get(link)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '.card.widget-card.text-center'))
        )
        inner_a = driver.find_element(By.CSS_SELECTOR, '.card.widget-card.text-center')
        a = driver.execute_script('return arguments[0].parentNode;', inner_a)
        if len(str(a.get_attribute('href') or "").strip()) > 0:
            result = a.get_attribute('href')
            # print('Resolved:', result)
            return result


    for i in range(len(links) // buffer_size + 1):
        buffer = list(
            map(lambda l: l.strip(),
                links[i * buffer_size:(i + 1) * buffer_size]))
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
