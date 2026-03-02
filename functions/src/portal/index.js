const { generatePortalToken } = require("./generatePortalToken");
const { sendPortalInvite } = require("./sendPortalInvite");
const { getPortalCustomToken } = require("./getPortalCustomToken");
const { activatePortal } = require("./activatePortal");
const { disablePortal } = require("./disablePortal");
const { enablePortal } = require("./enablePortal");
const { deletePortal } = require("./deletePortal");

module.exports = {
  generatePortalToken,
  sendPortalInvite,
  getPortalCustomToken,
  activatePortal,
  disablePortal,
  enablePortal,
  deletePortal,
};
