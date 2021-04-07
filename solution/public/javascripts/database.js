let db;

const CHAT_DB_NAME= 'db_chatroom';
const CHAT_STORE_NAME= 'store_chat';

/**
 * it inits the database
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(CHAT_DB_NAME, 1, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(CHAT_STORE_NAME)) {
                    let chatDB = upgradeDb.createObjectStore(CHAT_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatDB.createIndex('room', 'room', {unique: false});
                }
            }
        });
        console.log('db created');
    }
}

/**
 * store chat data
 * @param roomNo
 * @param chatText
 */
async function storeChatData(roomNo, chatText) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index('room');
            let record = await index.get(roomNo);

            if (record.chatHistory === undefined) {
                record.chatHistory = [chatText];
            }
            else {
                record.chatHistory = record.chatHistory.concat(chatText);
            }
            await store.put(record)

            await tx.complete;
        } catch(error) {
            console.log(error);
        };
    }
}

/**
 * store image
 * @param roomNo
 * @param imageBlob
 */
async function storeImageData(roomNo, imageBlob) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index('room');
            let record = await index.get(roomNo);

            if (record === undefined) {
                await store.put({room: roomNo, canvas: imageBlob});
            } else {
                record.canvas = imageBlob;
                await store.put(record);
            }

            await tx.complete;
        } catch (error) {
            console.log(error);
        }
    }
}

/**
 * retrieve the chat data for a room from the database
 * @param roomNo
 * @returns {*}
 */
async function getCachedData(roomNo) {
    if (!db)
        await initDatabase();
    if (db) {
        console.log('fetching ' + roomNo);
        try {
            let tx = db.transaction(CHAT_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index('room');
            let record = await index.get(roomNo);
            await tx.complete;
            return record;
        } catch (error) {
            console.log(error);
        }
    }
}
