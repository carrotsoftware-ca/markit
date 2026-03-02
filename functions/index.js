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
} = require("./src/portal");
const { analyseProjectFile } = require("./ai");

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
  analyseProjectFile,
};
