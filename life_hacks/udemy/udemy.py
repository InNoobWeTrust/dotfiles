import re
import time
import configparser
from pprint import pprint
from types import FunctionType
from typing import Callable, List, Optional

from telethon import TelegramClient, events, sync, functions, types
from telethon.sessions import StringSession
from telethon.utils import get_input_dialog

config = configparser.ConfigParser()
config.read('config.ini')
api_id = config['auth'].getint('api_id')
api_hash = config['auth']['api_hash']
bot_token = config['auth']['bot_token']
session = config['auth']['session']
client = TelegramClient(StringSession(session if session else ''), api_id, api_hash)

async def get_text_links(channel: str, validate: Optional[Callable[[str], bool]]=None):
    client.start(bot_token=bot_token)
    dialog = await client._get_input_dialog(channel)
    entity = await client.get_input_entity(channel)
    result = await client(functions.messages.GetPeerDialogsRequest(
        peers=[dialog]
    ))
    unread_count = result.dialogs[0].unread_count
    urls = []
    async for message in client.iter_messages(entity, limit=unread_count):
        if not message.text:
            continue
        if matches := re.findall(r'(?P<url>https?://[^\s]+)', message.text):
            if validate:
                urls.extend(filter(validate, matches))
            else:
                urls.extend(matches)
    if len(urls):
        pprint(urls)
    save_links(channel, urls)



async def get_entity_links(channel: str, validate: Optional[Callable[[str], bool]]=None):
    client.start(bot_token=bot_token)
    dialog = await client._get_input_dialog(channel)
    entity = await client.get_input_entity(channel)
    result = await client(functions.messages.GetPeerDialogsRequest(
        peers=[dialog]
    ))
    unread_count = result.dialogs[0].unread_count
    urls = []
    async for message in client.iter_messages(entity, limit=unread_count):
        for ent, txt in message.get_entities_text(types.MessageEntityUrl):
            if validate and not validate(txt):
                continue
            print(txt)
            urls.append(txt)
        for ent, txt in message.get_entities_text(types.MessageEntityTextUrl):
            if validate and not validate(ent.url):
                continue
            print(ent.url)
            urls.append(ent.url)
        if not message.buttons:
            continue
        for buttons in message.buttons:
            for button in buttons:
                if validate and not validate(button.url):
                    continue
                print(button.url)
                urls.append(button.url)
    save_links(channel, urls)


def save_links(channel: str ,links: List[str]):
    if not len(links):
        return
    with open(f'{channel}.txt', 'wt+', newline='\n') as f:
        f.writelines(link + '\n' for link in links)


def checkpoint():
    with open('checkpoint.txt', 'wt') as f:
        f.writelines(time.strftime("%Y%m%d-%H%M%S"))


def validate(link: str) -> bool:
    return link.startswith((
        'http://bit.ly',
        'https://bit.ly',
        'https://ift.tt',
        'https://www.discudemy.com',
        'https://coursesbits.com',
        'https://courson.xyz',
        'https://www.real.discount',
    ))

if __name__ == '__main__':
    with client:
        for channel in ['udemy2020', 'freeprogrammingcourses', 'discudemy_com', 'real_discount']:
            client.loop.run_until_complete(get_text_links(channel, validate=validate))
        for channel in ['udemy_learning_courses', 'Udemy4U']:
            client.loop.run_until_complete(get_entity_links(channel, validate=validate))
        checkpoint()
        with open('session.txt', 'wt') as f:
            f.write(client.session.save())
            f.flush()
