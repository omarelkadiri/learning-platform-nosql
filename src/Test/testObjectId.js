const { toObjectId } = require('../services/mongoService');

try {
    const validId = "6565c36efae7c87a94a5e4d2";  // Remplace par un vrai ObjectId de ta base
    const objectId = toObjectId(validId);
    console.log("ObjectId converti avec succès:", objectId);
} catch (error) {
    console.error("Erreur:", error.message);
}
