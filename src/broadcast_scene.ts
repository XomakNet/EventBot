import {Scenes} from "telegraf";
import {isTextMessage} from "./typeguards";
import {addLog, getAllCheckedInRequests, Request} from "./database";
import {delay} from "./utils";

export const broadcastScene = new Scenes.BaseScene<Scenes.SceneContext>("broadcast_scene");

broadcastScene.enter(ctx => {
    ctx.reply("Отправьте сообщение для отправки пришедшим участникам мероприятия.", {
        reply_markup: {
            keyboard: [
                [{text: "Отмена"}]
            ]
        }
    });
});

broadcastScene.on('message', async ctx => {
    if (!ctx.message?.chat.id) {
        throw new Error("Null sender chat");
    }
    if (isTextMessage(ctx.message) && ctx.message.text === 'Отмена') {
        ctx.scene.leave();
    } else {
        const requests = await getAllCheckedInRequests();
        await ctx.reply("Команда принята к исполнению");
        sendMessages(ctx, requests,
            requestId => addLog(requestId, "Sent broadcast text", "sentBroadcastText"),
            requestId => addLog(requestId, "Error while sending text", "sendBroadcastTextError"))
            .then(() => {
                ctx.reply("Рассылка завершена", {
                    reply_markup: {remove_keyboard: true}
                });
                ctx.scene.leave();
            });
    }
});

export const sendMessages = async (ctx: Scenes.SceneContext, requests: Request[], onRequestSent: (requestId: string) => Promise<unknown>, onRequestSendingError: (requestId: string) => Promise<unknown>) => {
    for (const request of requests) {
        try {
            ctx.copyMessage(Number(request.userId));
            await onRequestSent(request.requestId);
        } catch (e) {
            await onRequestSendingError(request.requestId);
        }

        await delay(1000);
    }
}