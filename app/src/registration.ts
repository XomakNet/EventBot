import {SceneSessionData} from "telegraf/typings/scenes";
import {Scenes} from "telegraf";
import {addRegistration, hasPlacesForEvent} from "./database";
import {isTextMessage} from "./typeguards";
import {eventId} from "./params";
import {confidenceOptions} from "./common_data";

interface RegistrationSession extends SceneSessionData {
    currentStep: number;
    answers: string[];
    isInPlaceRegistration: boolean;
}

interface Question {
    text: string;
    options?: string[];
    answerOnlyFromList: boolean;
}

const questions: Question[] = [
    {text: "Введите, пожалуйста, имя участника:", answerOnlyFromList: false},
    {
        text: "Укажите свою профессиональную область:",
        options: [
            "Backend-разработка",
            "Frontend-разработка",
            "Fullstack-разработка",
            "Мобильная разработка",
            "QA",
            "Менеджмент",
            "UI/UX",
            "DevOps"
        ],
        answerOnlyFromList: false,
    },
    {
        text: "Укажите свой уровень:",
        options: ["Предпочитаю не указывать", "Интересуюсь", "Junior", "Middle", "Senior", "Lead", "Architect"],
        answerOnlyFromList: false
    },
    {
        text: "Укажите название вашей компании:",
        options: [],
        answerOnlyFromList: false
    },
    {
        text: "Все мы знаем, что кто-то регистрируется на бесплатные мероприятия и не приходит. " +
            "Чтобы нам было проще, расскажите, пожалуйста, с какой вероятностью вы посетите наше мероприятие. " +
            "Позже можно будет изменить свое мнение или отменить регистрацию.",
        options: confidenceOptions,
        answerOnlyFromList: true
    }
]

const sendNextQuestion = (ctx: Scenes.SceneContext<RegistrationSession>) => {
    const currentQuestion = questions[ctx.scene.session.currentStep];
    const options = (currentQuestion.options ?? []).map(x => {
        return [{text: x}];
    });
    ctx.reply(currentQuestion.text, {
        reply_markup: {
            keyboard: [
                [{text: "Отмена"}], ...options
            ]
        }
    });
}

const proceedAnswer = (ctx: Scenes.SceneContext<RegistrationSession>) => {
    if (isTextMessage(ctx.message)) {
        const text = ctx.message.text;
        const currentQuestion = questions[ctx.scene.session.currentStep];
        if (currentQuestion.answerOnlyFromList && currentQuestion.options) {
            if (currentQuestion.options.findIndex(x => x === text) === -1) {
                return false;
            }
        }
        ctx.scene.session.answers.push(text);
        return true;
    }

    return false;
}

export const registrationScene = new Scenes.BaseScene<Scenes.SceneContext<RegistrationSession>>("registration_scene");

registrationScene.enter(async ctx => {
    const isInPlaceRegistration = (ctx.scene.state as any)['inPlace'] ?? false;
    if (!isInPlaceRegistration && !await hasPlacesForEvent(eventId)) {
        await ctx.reply("К сожалению, на мероприятие не осталось мест. Пожалуйста, попробуйте позже. Следите за новостями.");
        await ctx.scene.enter("main_scene");
        return;
    }
    ctx.scene.session.isInPlaceRegistration = isInPlaceRegistration;
    ctx.scene.session.currentStep = 0;
    ctx.scene.session.answers = [];
    sendNextQuestion(ctx);
});

const addRecord = async (ctx: Scenes.SceneContext<RegistrationSession>) => {
    const answers = ctx.scene.session.answers;
    if (!ctx.message?.chat.id) {
        throw new Error("Null sender chat");
    }

    const telegramName = ctx.message.from.username ?? null;
    const isInPlaceRegistration = ctx.scene.session.isInPlaceRegistration;

    const code = await addRegistration(
        eventId,
        ctx.message.chat.id.toString(),
        answers[0],
        telegramName,
        "created",
        answers[1],
        answers[2],
        answers[3],
        isInPlaceRegistration ? "Зарегистрировался на месте" : answers[4]);

    const text = isInPlaceRegistration ? `Спасибо за регистрацию, ваш код: ${code}` : `Спасибо. Регистрация выполнена, ваш код: ${code}.\nЖдём вас 23 сентября в 17:00 в IMPACT.T.\nЕсли поменяются планы, то, пожалуйста, сообщите нам об этом через меню \"Мои регистрации\".`;
    await ctx.reply(text, {
        reply_markup: {
            remove_keyboard: true
        }
    });

    await ctx.scene.enter("main_scene");
}

registrationScene.on('text', ctx => {
    if (ctx.message.text === "Отмена") {
        ctx.scene.enter("main_scene");
        return;
    }
    if (proceedAnswer(ctx)) {
        if (++ctx.scene.session.currentStep == questions.length) {
            addRecord(ctx).then(() => ctx.scene.leave());
        } else {
            sendNextQuestion(ctx);
        }
    } else {
        ctx.reply("Некорректное значение, попробуйте ещё раз");
    }
})