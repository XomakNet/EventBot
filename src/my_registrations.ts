import {Scenes} from "telegraf";
import {cancelRequest, getRegistrationForUser, updateConfidence} from "./database";
import {SceneSessionData} from "telegraf/typings/scenes";
import {isTextMessage} from "./typeguards";
import {confidenceOptions} from "./common_data";
import {eventId} from "./params";


interface MyRegistrationsSession extends SceneSessionData {
    requestId: string | null;
}

export const myRegistrationScenes = new Scenes.BaseScene<Scenes.SceneContext<MyRegistrationsSession>>("my_registrations_scene");

myRegistrationScenes.enter(async ctx => {
    if(!ctx.message?.chat.id) {
        throw new Error("Got message without chatId");
    }

    const registrations = await getRegistrationForUser(ctx.message.chat.id.toString(), eventId);
    const registrationButtons = registrations.map(x => [{"text": `${x.requestCode}: ${x.name}`}]);
    const text = registrations.length > 0 ? "У вас есть следующие регистрации. Выберите регистрацию для изменения или отмены." : "У вас нет регистраций на мероприятие."
    ctx.reply(text, {
        reply_markup: {
            keyboard: [
                [{text: "Отмена"}], ...registrationButtons
            ]
        }
    });

});

myRegistrationScenes.on('text', async ctx => {
	const registrations = await getRegistrationForUser(ctx.message.chat.id.toString(), eventId);
	if(!isTextMessage(ctx.message)) {
        ctx.reply("Некорректный ввод, попробуйте ещё раз.");
    }

    if (!ctx.scene.session.requestId) {
        if(ctx.message.text === "Отмена") {
            await ctx.scene.enter("main_scene");
            return;
        }

        const requestCode = ctx.message.text.slice(0, 6);
		const selectedRegistrations = registrations.filter(x => x.requestCode == requestCode);
		if(selectedRegistrations.length === 1) {
			ctx.scene.session.requestId = selectedRegistrations[0].requestId;
			const levelButtons = ["Не пойду", ...confidenceOptions].map(x => [{text: x}]);
            ctx.reply("Изменились планы? Укажите, пожалуйста, с какой уверенностью вы посетите мероприятие.", {
                reply_markup: {
                    keyboard: [
                        [{text: "Отмена"}], ...levelButtons
                    ]
                }
            });
		} else {
            ctx.reply("Некорректный ввод, попробуйте ещё раз.");
		}
    } else {
        const text = ctx.message.text;
        if(confidenceOptions.findIndex(x => x === text) !== -1) {
            await updateConfidence(ctx.scene.session.requestId, text);
            ctx.reply("Спасибо, информация обновлена.");
        } else if(text === "Не пойду") {
            await cancelRequest(ctx.scene.session.requestId);
            ctx.reply("Спасибо, ваша заявка отменена.");
        }
        await ctx.scene.enter("main_scene");
    }
})