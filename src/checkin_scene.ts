import {Scenes} from "telegraf";
import {checkIn, findActiveRequests} from "./database";
import {isTextMessage} from "./typeguards";
import {eventId} from "./params";

export const checkInScene = new Scenes.BaseScene<Scenes.SceneContext>("check_in_scene");

checkInScene.enter(ctx => {
    ctx.reply("Введите 6-ти значный код регистрации или его часть или имя, на которое осуществлена регистрация.");
});

checkInScene.start(ctx => ctx.scene.enter('main_scene'));

checkInScene.on('text', async ctx => {
    if (!isTextMessage(ctx.message)) {
        ctx.reply("Некорректный ввод, попробуйте ещё раз.");
    }
    const text = ctx.message.text;
    const foundOptionMatchGroups = text.match(foundOptionRegex)?.groups;
    const query = foundOptionMatchGroups ? foundOptionMatchGroups['code'] : text;
    const requests = await findActiveRequests(query, eventId);
    if (requests.length === 1 && foundOptionMatchGroups) {
        const request = requests[0];
        await checkIn(request.requestId);
        await ctx.reply(`Check in для ${request.requestCode} (${request.name}) выполнен`, {
            reply_markup: {remove_keyboard: true}
        });
        await ctx.scene.reenter();
    } else if(requests.length === 0) {
        ctx.reply("Ни одной регистрации по запросу не найдено");
    } else if(requests.length < 5) {
        const keyboardButtons = requests.map(x => [{text: `${x.requestCode}|${x.name}`}]);
        ctx.reply("Найдены следующие регистрации. Выберите нужную или выполните новый запрос.", {
            reply_markup: {
                keyboard: keyboardButtons
            }
        });
    } else {
        ctx.reply("Слишком много результатов по запросу, уточните запрос");
    }
});

const foundOptionRegex = /^(?<code>\w{6})\|.+$/;