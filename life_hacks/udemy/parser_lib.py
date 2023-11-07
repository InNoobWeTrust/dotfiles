import configparser
from time import sleep

from selenium import webdriver
from selenium.webdriver.remote.command import Command

config = configparser.ConfigParser()
config.read('config.ini')
use_remote_selenium = config['selenium']['use'] == 'true'
selenium_host = None
# remote_browser_options = webdriver.ChromeOptions()
remote_browser_options = webdriver.FirefoxOptions()
# remote_browser_options.add_argument('--headless')
if use_remote_selenium:
    selenium_host = config['selenium']['host']

class DriverContext:
    def __enter__(self):
        global use_remote_selenium
        if use_remote_selenium:
            global selenium_host
            global remote_browser_options
            self.__driver = webdriver.Remote(
                command_executor=selenium_host if selenium_host else 'http://localhost:4444/wd/hub',
                options=remote_browser_options,
                keep_alive=False,
            )
        else:
            firefox_options = webdriver.FirefoxOptions()
            firefox_options.add_argument('--headless')
            self.__driver = webdriver.Firefox(options=firefox_options, keep_alive=False)
        return self.__driver

    def __exit__(self, exc_type, exc_value, exc_tb):
        self.__driver.close()
        sleep(3)
        self.__driver.quit()
        sleep(3)
        self.__driver = None
