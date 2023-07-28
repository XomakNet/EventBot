## 1. Project setup
#### 1.1. Environment setup
Copy `.env.example` to `.env`.
Write your params in `.env`.

#### 1.2. Service start
```shell
make start
```
Wait for a moment.
Ensure, that everything is fine. Execute `make status`, you should get output like this:
```shell
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
eventbot-app-1      eventbot-app        "docker-entrypoint.s…"   app                 4 minutes ago       Up 3 minutes        
eventbot-db-1       postgres:14.5       "docker-entrypoint.s…"   db                  22 minutes ago      Up 22 minutes       127.0.0.1:5432->5432/tcp
```

#### 1.3. Database initialization
In the first time you have to init the database. To do this, execute the following command:
```shell
make init-db
```

#### 1.4. Application configuration
Using the database management tool do the following:
1. Add first event in `events` table. `registrationsLimit` is a number of allowed registrations for this event. `isActive` currently is not used (Active `eventId` is hard-coded in `params.ts` - use this id for the first event).
2. Add admins/inspectors in `admins` table. `userId` is a telegram user id. `roles` is coma-separated values of roles. Currently supported "admin" and "inspector".