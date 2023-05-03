import {Scenes, session, Telegraf} from "telegraf";
import {registrationScene} from "./registration";
import {myRegistrationScenes} from "./my_registrations";
import {mainScene} from "./main_scene";
import {subscribeOnReplyConfidence, subscribeOnSentClarificationsAdminCommand} from "./clarify_status";
import {checkInScene} from "./checkin_scene";

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN as string);

const stage = new Scenes.Stage<Scenes.SceneContext<any>>(
    [
        mainScene,
        registrationScene,
        myRegistrationScenes,
        checkInScene
    ], {default: "main_scene"});

subscribeOnReplyConfidence(bot);
subscribeOnSentClarificationsAdminCommand(bot);

bot.use(session());
bot.use(stage.middleware());

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
