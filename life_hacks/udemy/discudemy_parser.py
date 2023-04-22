import sys
import os
import configparser

from requests_html import AsyncHTMLSession
from time import sleep

config = configparser.ConfigParser()
config.read('config.ini')
buffer_size = int(config['discudemy']['buffer_size'])

asession = AsyncHTMLSession()
results = []
counter = 0
if os.path.isfile('discudemy_com.resolved.txt'):
    with open('discudemy_com.resolved.txt', 'rt') as f:
        lines = f.readlines()
        counter = len([l for l in lines if l.strip(' \n') != ''])

links = []

if not os.path.isfile('discudemy_com.txt'):
    sys.exit()
with open('discudemy_com.txt', 'rt') as f:
    links.extend(list(map(lambda l: l.strip(), f.readlines())))

links = [link.replace('https://www.discudemy.com', 'https://www.discudemy.com/go', 1) for link in links]
links = links[counter:]

with open('discudemy_com.resolved.txt', 'at+') as wf:

    def resolve_link(link):
        async def ret():
            s = await asession.get(link)
            await s.html.arender(retries=3, wait=1, scrolldown=2, sleep=1)
            a = s.html.find('a#couponLink', first=True)
            if a:
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
