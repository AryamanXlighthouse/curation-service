import { downloadFileAndExtractHashes } from "../utils/ipfsUtils.js";
import { processCIDv0, processCIDv1 } from "../utils/customUtils.js";
import { checkLinkStatusAndContent } from "../utils/linkCheckUtils.js";

// Function to display the processed output of a CID
function displayProcessedOutput(inputCid, index) {
  const output0 = processCIDv0(inputCid);
  const output1 = processCIDv1(output0);
  const upperCasedOutput = output1.toUpperCase();
  const indexOfRemoval = upperCasedOutput.indexOf(": ") + 2;
  const processedOutput =
    upperCasedOutput.slice(0, indexOfRemoval) +
    upperCasedOutput.slice(indexOfRemoval + 1);
  
  return `CID ${index}: ${processedOutput}`;
}

export const getDigestHash = async (req, res) => {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
  }

  try {
    const hashList = await downloadFileAndExtractHashes(cid);
    const outputList = [displayProcessedOutput(cid, 1)];
    hashList.forEach((cid, index) => {
      outputList.push(displayProcessedOutput(cid, index + 2));
    });

    return res.json({ "List of hash digest:": outputList });
  } catch (error) {
    return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
  }
};

export const listCIDs = async (req, res) => {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
  }

  try {
    const hashList = await downloadFileAndExtractHashes(cid);
    const outputList = [`CID 1: ${cid}`];
    hashList.forEach((cid, index) => {
      outputList.push(`CID ${index + 2}: ${cid}`);
    });

    return res.json({ "List of hashes:": outputList });
  } catch (error) {
    return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
  }
};

export const checkLink = async (req, res) => {
    const { cid } = req.query;
  
    if (!cid) {
      return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
    }
  
    try {
      const hashList = [cid];
      const allHashList = await downloadFileAndExtractHashes(cid);
      hashList.push(...allHashList);
  
      const blockedLinks = [];
      const unsureLinks = [];
      const legitLinks = [];
  
      for (let index = 0; index < hashList.length; index++) {
        const _cid = hashList[index];
        const linkStatus = await checkLinkStatusAndContent(_cid, 5); // Replace 5 with the desired timeout in seconds
  
        if (linkStatus === true) {
          blockedLinks.push(displayProcessedOutput(_cid, index + 1));
        } else if (linkStatus === 'unsure') {
          unsureLinks.push(_cid);
        } else {
          legitLinks.push(_cid);
        }
      }
  
      return res.json({
        "List of blocked IPFS links:": blockedLinks,
        "Unsure IPFS links:": unsureLinks,
        "List of legitimate IPFS links:": legitLinks,
        totalBlocked: blockedLinks.length,
        totalUnsure: unsureLinks.length,
        totalLegit: legitLinks.length,
      });
    } catch (error) {
      return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
    }
  };
  
  
  
