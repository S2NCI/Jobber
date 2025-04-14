const db = require('../db/db');

const eventTypes = {
    INFO: 'info',
    ERROR: 'error',
    WARNING: 'warning',
    SYSTEM: 'system'
};

// Log into a db instead of the console
function log(eventType, message, userId = 0) {
    const stmt = `
    INSERT INTO logs (event_type, message, user_id, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `;

    db.run(stmt, [eventType, message, userId], function (err) {
        if (err) {
            console.error('[Logger Error]', err.message);
        }
    });

}

// Convenience methods
function logInfo(message, userId = 0) {
    log(eventTypes.INFO, message, userId);
}

function logError(message, userId = 0) {
    log(eventTypes.ERROR, message, userId);
}

function logWarning(message, userId = 0) {
    log(eventTypes.WARNING, message, userId);
}

function logSystem(message, userId = 0) {
    // put it into the console if it's a system log
    console.log(`[System] ${message}`);
    log(eventTypes.SYSTEM, message, userId);
}

module.exports = {
    log,
    logInfo,
    logError,
    logWarning,
    logSystem
};