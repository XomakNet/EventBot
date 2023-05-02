import {Markup, Telegraf} from "telegraf";
import {confidenceOptions} from "./common_data";
import {delay} from "./utils";
import {isTextMessage} from "./typeguards";
import {
    addLog,
    cancelRequest,
    getAllActiveRequests,
    getRegistrationForUser,
    Request,
    updateConfidence
} from "./database";
import {adminId} from "./params";

const requestForConfidence = async (bot: Telegraf<any>, chatId: number, requestCode: string, text: string) => {
    const confidenceKeyboard = [...confidenceOptions, "Не пойду"].map(x => [Markup.button.callback(x, `replyConfidence_${requestCode}_'${x}'`)])
    await bot.telegram.sendMessage(chatId, `${text}\n Укажите, пожалуйста, статус для вашей заявки ${requestCode}`, {
        ...Markup.inlineKeyboard(confidenceKeyboard)
    });
}

export const sendRequests = async (bot: Telegraf<any>, text: string, requests: Request[], onRequestSent: (requestId: string) => Promise<unknown>) => {
    for (const request of requests) {
        await requestForConfidence(bot, Number(request.userId), request.requestCode, text);
        await onRequestSent(request.requestId);
        await delay(1000);
    }
}

const answerByEditingMessage = async (ctx: any, message: string) => {
    try {
        await ctx.editMessageText(message);
    } catch (e) {
        console.error(e);
    }
}

export const subscribeOnReplyConfidence = (bot: Telegraf<any>) => {
    bot.action(replyRegex, async ctx => {
        const answer = ctx.match.groups['answer'];
        const requestCode = ctx.match.groups['requestCode'];
        const chatId = ctx.update?.callback_query?.message?.chat.id;
        if (!chatId) {
            throw new Error("Null sender chat");
        }
        const usersRegistrations = await getRegistrationForUser(chatId.toString());
        const request = usersRegistrations.find(x => x.requestCode === requestCode);
        if (request) {
            if (confidenceOptions.findIndex(x => x === answer) !== -1) {
                await updateConfidence(request.requestId, answer);
                await answerByEditingMessage(ctx, `Спасибо. Для заявки ${requestCode} установили "${answer}".`);
            } else if (answer === "Не пойду") {
                await cancelRequest(request.requestId);
                await answerByEditingMessage(ctx, `Спасибо. Отменили вашу регистрацию ${requestCode}.`);
            }
        } else {
            await answerByEditingMessage(ctx, "Произошла ошибка при попытке изменить статус по заявке. Возможно, вы отменили эту заявку.");
            return;
        }

    });
};

export const subscribeOnSentClarificationsAdminCommand = (bot: Telegraf<any>) => {
    bot.command('sendClarifications', async ctx => {
        if (!ctx.message?.chat.id) {
            throw new Error("Null sender chat");
        }
        if (isTextMessage(ctx.message) && ctx.message.chat.id == adminId) {
            const match = ctx.message.text.match(commandRegex);
            if (match && match.groups) {
                const text = match.groups['text'];
                const requests = await getAllActiveRequests();
                await ctx.reply("Команда принята к исполнению");
                sendRequests(bot, text, requests, requestId => addLog(requestId, "Sent clarification text", "sentClarificationText")).then(() => ctx.reply("Рассылка завершена"));
            } else {
                ctx.reply("Некорректная команда");
            }
        }
    });
}

const commandRegex = /\/\w+ (?<text>.+)/is;
const replyRegex = /^replyConfidence_(?<requestCode>\w+)_'(?<answer>.+)'$/;