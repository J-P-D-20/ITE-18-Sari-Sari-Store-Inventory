import fs from 'fs/promises';

const LOG_FILE = './audit.json'; // change to .json for structured logs

export async function logEvent(action, productName, details = "") {
    const logEntry = {
        timestamp: Date.now(),
        action,
        productName,
        details
    };

    try {
        let logs = [];

        try {
            const data = await fs.readFile(LOG_FILE, 'utf-8');
            logs = JSON.parse(data);
        } catch {
        }

        logs.push(logEntry);

        await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error("Error writing to log file:", err);
    }
}

// Read and return JSON logs
export async function readLogs() {
    try {
        const data = await fs.readFile(LOG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading logs:", err);
        return [];
    }
}

