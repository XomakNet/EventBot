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

export const addLog = async (requestId: string, text: string, type: string) => {
    await client.query("INSERT INTO log (content, \"requestId\", \"type\") VALUES ($1, $2, $3)", [text, requestId, type]);
}

export const addRegistration = async (eventId: string,
                                      userId: string,
                                      name: string,
                                      telegramName: string | null,
                                      status: Status,
                                      professionalSphere: string,
                                      professionalLevel: string,
                                      companyName: string,
                                      confidence: string): Promise<string> => {
    const requestCode = makeId(6);
    const requestId = randomUUID();
    const values = [eventId, requestId, requestCode, userId, name, telegramName, status, professionalSphere, professionalLevel, companyName, confidence];
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
        "\"companyName\"," +
        "\"confidence\")" +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);", values);
    await addLog(requestId, "", "newRegistration");
    return requestCode;
}

export const hasPlacesForEvent = async (eventId: string): Promise<boolean> => {
    const events = await client.query("SELECT * FROM \"events\" WHERE \"eventId\" = $1", [eventId]);
    const requestsCountData = await client.query("SELECT COUNT(*) as \"eventsCount\" FROM \"requests\" WHERE \"eventId\" = $1 AND status IN ('created', 'checkedIn')", [eventId]);
    return Number(events.rows[0].registrationsLimit) >= Number(requestsCountData.rows[0].eventsCount);
}

export const updateConfidence = async (requestId: string, newConfidence: string) => {
    const values = [requestId, newConfidence];
    await client.query("UPDATE requests SET confidence = $2 WHERE \"requestId\" = $1", values);
    await addLog(requestId, `New confidence: ${newConfidence}`, "updateConfidence");
}

export const cancelRequest = async (requestId: string) => {
    const values = [requestId, "refused"];
    await client.query("UPDATE requests SET status = $2 WHERE \"requestId\" = $1", values);
    await addLog(requestId, "", "cancelRequest");
}

export const getRegistrationForUser = async (userId: string, eventId: string): Promise<Request[]> => {
    const result = await client.query("SELECT * FROM requests WHERE \"userId\" = $1 AND status = $2 AND \"eventId\" = $3", [userId, "created", eventId]);
    return result.rows;
}

export const getAllActiveRequests = async (eventId: string): Promise<Request[]> => {
    const result = await client.query("SELECT * FROM requests WHERE status = $1 AND \"eventId\" = $2", ["created", eventId]);
    return result.rows;
}

export const getAllCheckedInRequests = async (eventId: string): Promise<Request[]> => {
    const result = await client.query("SELECT * FROM requests WHERE status = $1 AND \"eventId\" = $2", ["checkedIn", eventId]);
    return result.rows;
}

export const findActiveRequests = async (request: string, eventId: string): Promise<Request[]> => {
    const result = await client.query("SELECT * FROM requests WHERE status = $1 AND \"eventId\" = $2 AND (\"requestCode\" ILIKE $3 OR \"name\" ILIKE $4)", ["created", eventId, `${request}%`, `%${request}%`]);
    return result.rows;
};

export const checkIn = async (requestId: string): Promise<void> => {
    const values = [requestId, "checkedIn"];
    await client.query("UPDATE requests SET status = $2 WHERE \"requestId\" = $1", values);
    await addLog(requestId, "", "checkIn");
};

export const hasAdminRole = async (userId: string, role: string): Promise<boolean> => {
    const result = await client.query("SELECT count(*) FROM admins WHERE \"userId\" = $1 AND \"roles\" ILIKE $2", [userId, `%${role}%`]);
    return Number(result.rows[0].count) === 1;
}

export const getAdminToken = async (userId: string): Promise<boolean> => {
    const result = await client.query("SELECT token FROM admins WHERE \"userId\" = $1", [userId]);
    return result.rows[0].token;
}