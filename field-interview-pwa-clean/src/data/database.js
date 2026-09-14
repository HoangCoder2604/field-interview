const DB_NAME = "fieldInterviewDB";
const DB_VERSION = 1;
const INTERVIEW_STORE = "interviews";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(INTERVIEW_STORE)) {
        const store = database.createObjectStore(INTERVIEW_STORE, { keyPath: "id" });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveInterviewRecord(record) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(INTERVIEW_STORE, "readwrite");

    transaction.objectStore(INTERVIEW_STORE).put(record);
    transaction.oncomplete = () => resolve(record);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getInterviewRecord(id) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const request = database
      .transaction(INTERVIEW_STORE, "readonly")
      .objectStore(INTERVIEW_STORE)
      .get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllInterviewRecords() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const request = database
      .transaction(INTERVIEW_STORE, "readonly")
      .objectStore(INTERVIEW_STORE)
      .getAll();

    request.onsuccess = () => {
      const records = request.result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      resolve(records);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getPendingInterviewRecords() {
  const records = await getAllInterviewRecords();
  return records.filter((record) => record.syncStatus !== "synced");
}
