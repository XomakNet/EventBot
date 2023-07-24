import {Message} from "typegram";
import TextMessage = Message.TextMessage;

export function isTextMessage(message: any): message is TextMessage {
    return 'text' in message;
}