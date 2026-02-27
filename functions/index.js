const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions");
const { generatePortalToken, sendPortalInvite, activatePortal } = require("./portal");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

module.exports = { generatePortalToken, sendPortalInvite, activatePortal };
