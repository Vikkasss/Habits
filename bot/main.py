from aiogram import Bot, Dispatcher, types
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from aiogram.utils import executor
from dotenv import load_dotenv
import os

load_dotenv()
API_TOKEN = os.getenv("BOT_TOKEN")  # Токен из .env-файла
bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    web_app = WebAppInfo(url='https://ваш-хостинг.com/habits')  # Ваш HTTPS-URL
    button = KeyboardButton(text='Open the web app', web_app=web_app)
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(button)
    await message.answer("Нажмите кнопку ниже для запуска веб-приложения:", reply_markup=keyboard)

@dp.message_handler(content_types=['web_app_data'])
async def handle_web_app_data(message: types.Message):
    data = message.web_app_data.data
    await message.answer(f"Данные от Mini App: {data}")

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)