// base urlnya yang ada di api (pakai path absolut biar aman di halaman nested)
export const API_BASE = "/konser/api/index.php";

export function api(action) {
    return `${API_BASE}?action=${action}`;
}

//cara lain
// export const api = (action) => `${API_BASE}?action=${action}`;

// Semua endpoint API kamu
// pakai export supy bisa dipakai ditmpt lain
export const API = {
    // AUTH
    REGISTER: api("register"),
    LOGIN: api("login"),
    LOGOUT: api("logout"),

    // USER
    USER_SHOW: api("user_show"),
    USER_UPDATE: api("user_update"),
    USER_UPDATE_PASSWORD: api("user_update_password"),
    USER_UPDATE_PHOTO: api("user_update_photo"),
    USER_DELETE: api("user_delete"),

    // EVENT
    EVENTS: api("events"),
    EVENT_SHOW: api("event_show"),
    EVENT_CREATE: api("event_create"),
    EVENT_UPDATE: api("event_update"),
    EVENT_DELETE: api("event_delete"),

    // TICKET
    TICKETS: api("tickets"),
    TICKET_SHOW: api("ticket_show"),
    TICKET_CREATE: api("ticket_create"),
    TICKET_UPDATE: api("ticket_update"),
    TICKET_DELETE: api("ticket_delete"),

    // TRANSACTION
    TRANSACTIONS: api("transactions"),
    TRANSACTION_SHOW: api("transaction_show"),
    TRANSACTION_CREATE: api("transaction_create"),
    TRANSACTION_UPDATE: api("transaction_update"),
    TRANSACTION_DELETE: api("transaction_delete"),

    // LOCATION
    LOCATIONS: api("locations"),
    LOCATION_SHOW: api("location_show"),
};

// Storage api path
export const STORAGE = {
    PROFILE: "/konser/api/storage/profile/",
};
