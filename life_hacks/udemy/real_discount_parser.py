import os
import configparser

from requests_html import AsyncHTMLSession
from time import sleep

config = configparser.ConfigParser()
config.read('config.ini')
buffer_size = int(config['real_discount']['buffer_size'])

asession = AsyncHTMLSession()
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

        async def ret():
            s = await asession.get(link)
            await s.html.arender(retries=3, wait=1, scrolldown=2, sleep=1)
            a = s.html.find('a:has(.card.widget-card.text-center)', first=True)
            if a:
                result = a.element.attrib['href']
                # print('Resolved:', result)
                return result

        return ret

    for i in range(len(links) // buffer_size + 1):
        buffer = list(
            map(lambda l: l.strip(),
                links[i * buffer_size:(i + 1) * buffer_size]))
        if len(buffer) == 0:
            break
        counter += len(buffer)
        print('Resolving:', *buffer, sep='\n')
        resolved_links = asession.run(*map(resolve_link, buffer))
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
