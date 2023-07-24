![GitHub](https://img.shields.io/github/license/XomakNet/EventBot)
![GitHub top language](https://img.shields.io/github/languages/top/XomakNet/EventBot)
![GitHub repo size](https://img.shields.io/github/repo-size/XomakNet/EventBot)


## 1. Настройка проекта
#### 1.1. Настройка переменных
Необходимо скопировать файл `.env.example` в `.env`.
После этого прописать свои значения в `.env`.

#### 1.2. Запуск сервиса
```shell
make start
```

#### 1.3. Инициализация базы данных
После старта сервиса нужно создать базу данных.  
Но сначала нужно убедиться что всё запустилось корректно.  
Это можно сделать выполнив команду `make status`.  
Вывод в консоль должен быть примерно таким:
```shell
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
eventbot-app-1      eventbot-app        "docker-entrypoint.s…"   app                 4 minutes ago       Up 3 minutes        
eventbot-db-1       postgres:14.5       "docker-entrypoint.s…"   db                  22 minutes ago      Up 22 minutes       127.0.0.1:5432->5432/tcp
```
Если всё ок, то нужно выполнить команду создания базы данных:
```shell
make init-db
```