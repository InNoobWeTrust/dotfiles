import os
import configparser

from requests_html import AsyncHTMLSession
from time import sleep

config = configparser.ConfigParser()
config.read('config.ini')
buffer_size = int(config['courson']['buffer_size'])

asession = AsyncHTMLSession()
results = []
counter = 0
if os.path.isfile('courson.resolved.txt'):
    with open('courson.resolved.txt', 'rt') as f:
        lines = f.readlines()
        counter = len([l for l in lines if l.strip(' \n') != ''])

links = []
for file_name in ['udemy_learning_courses.txt', 'Udemy4U.txt']:
    if not os.path.isfile(file_name):
        continue
    with open(file_name, 'rt') as f:
        links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = links[counter:]

with open('courson.resolved.txt', 'at+') as wf:

    def resolve_link(link):
        async def ret():
            s = await asession.get(link)
            await s.html.arender(retries=3, wait=1, scrolldown=2, sleep=1)
            a = s.html.find('div.enroll-btn > a', first=True)
            if a and len(a.element.attrib['href'].strip()) > 0:
                result = a.element.attrib['href']
                # print('Resolved:', result)
                return result
        return ret

    for i in range(len(links) // buffer_size + 1) :
        buffer = list(map(lambda l: l.strip(), links[i * buffer_size : (i + 1) * buffer_size]))
        if len(buffer) == 0:
            break
        print('Resolving:', *buffer, sep='\n')
        resolved_links = asession.run(*map(resolve_link, buffer))
        resolved_links = [link for link in resolved_links if link]
        counter += len(resolved_links)
        print("Resolved:", *resolved_links, sep='\n')
        results.extend(resolved_links)
        wf.writelines([line + '\n' for line in resolved_links])
        wf.flush()
        print("Total processed:", counter)
        sleep(5)

print(results)
print("Total processed:", counter)
