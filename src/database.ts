import {Client} from "pg";
import {randomUUID} from "crypto";
import {makeId} from "./utils";

export type Status = "created" | "canceled" | "checkedIn";
export interface Request {
    eventId: string;
    requestId: string;
    userId: string;
    name: string;
    requestCode: string;
    status: Status;
}

const client = new Client(process.env.DATABASE_CONNECTION_STRING as string);
client.connect();

export const addRegistration = async (eventId: string,
                                      userId: string,
                                      name: string,
                                      telegramName: string | null,
                                      status: Status,
                                      professionalSphere: string,
                                      professionalLevel: string,
                                      confidence: string): Promise<string> => {
    const requestCode = makeId(6);
    const values = [eventId, randomUUID(), requestCode, userId, name, telegramName, status, professionalSphere, professionalLevel, confidence];
    await client.query("INSERT INTO requests " +
        "(\"eventId\", " +
        "\"requestId\", " +
        "\"requestCode\"," +
        "\"userId\", " +
        "name, " +
        "\"telegramUserName\", " +
        "status, " +
        "\"professionalSphere\", " +
        "\"professionalLevel\"," +
        "\"confidence\")" +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);", values);
    return requestCode;
}

export const hasPlacesForEvent = async (eventId: string): Promise<boolean> => {
    const events = await client.query("SELECT * FROM \"events\" WHERE \"eventId\" = $1", [eventId]);
    const requestsCountData = await client.query("SELECT COUNT(*) as \"eventsCount\" FROM \"requests\" WHERE \"eventId\" = $1 AND status = $2", [eventId, "created"]);
    return events.rows[0].registrationsLimit >= requestsCountData.rows[0].eventsCount;
}

export const updateConfidence = async (requestId: string, newConfidence: string) => {
    const values = [requestId, newConfidence];
    await client.query("UPDATE requests SET confidence = $2 WHERE \"requestId\" = $1", values);
}

export const cancelRequest = async (requestId: string) => {
    const values = [requestId, "refused"];
    await client.query("UPDATE requests SET status = $2 WHERE \"requestId\" = $1", values);
}

export const getRegistrationForUsers = async (userId: string): Promise<Request[]> => {
    const result = await client.query("SELECT * FROM requests WHERE \"userId\" = $1 AND status = $2", [userId, "created"]);
    return result.rows;
}