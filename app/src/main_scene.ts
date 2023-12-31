import {Scenes} from "telegraf";
import {isTextMessage} from "./typeguards";
import {hasAdminRole} from "./database";


export const mainScene = new Scenes.BaseScene<Scenes.SceneContext>("main_scene");

const sendMenu = (ctx: Scenes.SceneContext) => {
    ctx.reply("Добро пожаловать! Этот бот управляет регистрациями на митап релокейшн IT в Ташкенте.", {
        reply_markup: {
            keyboard: [
                [{text: "Новая регистрация"}],
                [{text: "Мои регистрации"}]
            ]
        }
    });
}

mainScene.enter(ctx => sendMenu(ctx));

mainScene.command('control', async ctx => {
    if (!ctx.message?.chat.id) {
        throw new Error("Null sender chat");
    }
    if (await hasAdminRole(ctx.message.chat.id.toString(), 'inspector')) {
        ctx.scene.enter('check_in_scene');
    }
});

mainScene.command('broadcast', async ctx => {
    if (!ctx.message?.chat.id) {
        throw new Error("Null sender chat");
    }
    if (await hasAdminRole(ctx.message.chat.id.toString(), 'admin')) {
        ctx.scene.enter('broadcast_scene');
    }
});

mainScene.on('text', ctx => {
    if (!isTextMessage(ctx.message)) {
        ctx.reply("Некорректный ввод");
    }

    switch (ctx.message.text) {
        case "Новая регистрация":
            ctx.scene.leave();
            ctx.scene.enter("registration_scene");
            break;
        case "242":
            ctx.scene.leave();
            ctx.scene.enter("registration_scene", {inPlace: true});
            break;
        case "Мои регистрации":
            ctx.scene.leave();
            ctx.scene.enter("my_registrations_scene");
            break;
        default:
            sendMenu(ctx);
    }
});