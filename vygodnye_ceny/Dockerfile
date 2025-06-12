FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходники Django-проекта
COPY . .

# Собираем статику (можешь убрать, если не используешь)
RUN python manage.py collectstatic --noinput || true

# Выполняем миграции (можешь убрать, если хочешь делать вручную)
RUN python manage.py migrate || true

# Открываем порт 8000
EXPOSE 8000

# Стартуем сервер (dev-режим)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
