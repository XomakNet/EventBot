![GitHub](https://img.shields.io/github/license/XomakNet/EventBot)
![GitHub top language](https://img.shields.io/github/languages/top/XomakNet/EventBot)
![GitHub repo size](https://img.shields.io/github/repo-size/XomakNet/EventBot)

# EventBot
EventBot — simple Telegram bot, providing registration, check in and communication with guests for event organizers (meetups, conferences, etc.).
## Notice
Currently the bot is in the beginning of the development. It was deleloped in a limited time and we are not proud of its code quality. However, it's almost ready for use in basic scenario (all you need is to change texts, which currently are hard-coded) and was tested during several meetups.
## Features
### User self-registration and request status control
Using this bot anyone can register himself to your event. During registration bot can collect answers for several questions (e.g. proffesional sphere and level). Also, bot collects "degree of confidence" ("I'll definetly go", "Probably I will", "I am not sure") — it's very helpful for free event organizers.
Later users can change their confidence or to cancel the registration.
### Check in
You can give "inspector" permission for any user, making control mode available for him. In this mode "inspector" can check in users, using their special 6-chars registration code or by name.
Also, the bot generates QR-code with this special 6-chars code. During our meetup it was scanned using our simple on AppSmith, which probably will be also published here.

### Degree of confidence clearification
Before the event you might want to estimate number of guests. To do this you can send custom message to all registered users with inline buttons with "degree of confidence". It will remind guests about event and allow them to change their mind in seconds.

### Message broadcasting
During or after an event you can broadcast a message to all checked in guests.

## Bot management
Currently bot does not have special admin interface or admin mode (except check in, confidence clarification and message broadcasting modes), therefore we recommend to use database management platform (e.g. pgAdmin).
## Commands reference
/control - enters the control mode for inspector (requires "inspector" role)
/broadcast - enters message broadcasting mode (requires "admin" role)
/sendClarifications [Clarification text] - sends text with inline-clarification buttons to all registered guests (requires "admin" role)
## Setup and start
Read the [doc](https://github.com/XomakNet/EventBot/blob/master/docs/Start.md)
## License and contribution
We are open for your PRs.
This repository has been released under the  [GPT-3 License](https://github.com/XomakNet/EventBot/blob/master/LICENSE.md).
By contributing to EventBot, you agree that your contributions will be licensed under its MIT License.

