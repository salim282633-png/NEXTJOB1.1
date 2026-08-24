import { getApp, getApps, initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);
