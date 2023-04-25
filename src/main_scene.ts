import {Scenes} from "telegraf";
import {isTextMessage} from "./typeguards";
import {SceneContext} from "telegraf/typings/scenes";


export const mainScene = new Scenes.BaseScene<Scenes.SceneContext>("main_scene");

const sendMenu = (ctx: SceneContext) => {
    ctx.reply("Добро пожаловать! Этот бот управляет регистрациями на второй митап релокейшн IT в Ташкенте.", {
        reply_markup: {
            keyboard: [
                [{text: "Новая регистрация"}],
                [{text: "Мои регистрации"}]
            ]
        }
    });
}

mainScene.enter(ctx => sendMenu(ctx));

mainScene.on('text', ctx => {
    if(!isTextMessage(ctx.message)) {
        ctx.reply("Некорректный ввод");
    }

    switch(ctx.message.text) {
        case "Новая регистрация":
            ctx.scene.leave();
            ctx.scene.enter("registration_scene");
            break;
        case "Мои регистрации":
            ctx.scene.leave();
            ctx.scene.enter("my_registrations_scene");
            break;
        default:
            sendMenu(ctx);
    }
});