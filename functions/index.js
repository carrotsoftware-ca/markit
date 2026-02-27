const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions");
const {
  generatePortalToken,
  sendPortalInvite,
  getPortalCustomToken,
  activatePortal,
  disablePortal,
  enablePortal,
  deletePortal,
} = require("./portal");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

module.exports = {
  generatePortalToken,
  sendPortalInvite,
  getPortalCustomToken,
  activatePortal,
  disablePortal,
  enablePortal,
  deletePortal,
};
