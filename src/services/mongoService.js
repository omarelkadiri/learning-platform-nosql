const config = require('../config/env');
const { getDb } = require('../config/db');

async function insertOne(collectionName, document) {
    const db = getDb();
    return db.collection(collectionName).insertOne(document);
}

async function find(collectionName, query = {}) {
    const db = getDb();
    return db.collection(collectionName).find(query).toArray();
}

async function findById(collectionName, id) {
    const db = getDb();
    return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
}

async function updateOne(collectionName, id, updateData) {
    const db = getDb();
    return db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

async function deleteOne(collectionName, id) {
    const db = getDb();
    return db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
    insertOne,
    find,
    findById,
    updateOne,
    deleteOne
};
