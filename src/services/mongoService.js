const config = require('../config/env');
const {  getMongoDB } = require('../config/db');
const { ObjectId } = require('mongodb');

async function insertOne(collectionName, document) {
    const db = getMongoDB();
    return db.collection(collectionName).insertOne(document);
}

async function find(collectionName, query = {}) {
    const db = getMongoDB();
    return db.collection(collectionName).find(query).toArray();
}

async function findById(collectionName, id) {
    const db = getMongoDB();
    return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
}

async function updateOne(collectionName, id, updateData) {
    const db = getMongoDB();
    return db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: updateData });
}

async function deleteOne(collectionName, id) {
    const db = getMongoDB();
    return db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
}

function toObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error("L'ID fourni n'est pas valide");
    }
    
    try {
        return new ObjectId(id);
    } catch (error) {
        throw new Error(" ID invalide : " + id);
    }
}



module.exports = {
    insertOne,
    find,
    findById,
    updateOne,
    deleteOne,
    toObjectId
};
