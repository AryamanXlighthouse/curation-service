import express from 'express';
import { checkAPIKey } from '../middleware/auth.js';
import { getDigestHash, listCIDs, checkLink } from '../controllers/processCIDController.js';

const router = express.Router();

router.get('/get_digest_hash', checkAPIKey, getDigestHash);
router.get('/list_cids', checkAPIKey, listCIDs);
router.delete('/remove_file', checkAPIKey, checkLink);

export default router;
