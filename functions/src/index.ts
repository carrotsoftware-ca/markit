import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";

// Initialise the Admin SDK once at module load
admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// Portal functions — generatePortalToken + sendPortalInvite
export { generatePortalToken, sendPortalInvite } from "./portal";
