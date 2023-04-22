import sys
import os

from requests_html import AsyncHTMLSession
from time import sleep

asession = AsyncHTMLSession()
results = []
counter = 0
if os.path.isfile('real_discount.resolved.txt'):
    with open('real_discount.resolved.txt', 'rt') as f:
        lines = f.readlines()
        counter = len([l for l in lines if l.strip(' \n') != ''])

with open('real_discount.txt', 'rt') as rf:
    with open('real_discount.resolved.txt', 'at+') as wf:

        def resolve_link(link):
            async def ret():
                s = await asession.get(link)
                await s.html.arender(retries=3, wait=1, scrolldown=2, sleep=1)
                find_results = s.html.find('a:has(.card.widget-card.text-center)')
                if len(find_results) > 0:
                    result = find_results[0].element.attrib['href']
                    # print('Resolved:', result)
                    return result
            return ret

        links = rf.readlines()
        iter_links = iter(links[counter:])

        for link in iter_links:
            buffer = [link.strip()]
            buffer += [next(iter_links).strip() for _ in range(4)]
            print('Resolving:', *buffer, sep='\n')
            resolved_links = asession.run(*map(resolve_link, buffer))
            counter += len(resolved_links)
            print("Resolved:", *resolved_links, sep='\n')
            results.extend(resolved_links)
            wf.writelines([line + '\n' for line in resolved_links])
            wf.flush()
            print("Total processed:", counter)
            sleep(5)

print(results)
print("Total processed:", counter)
