import { downloadFileAndExtractHashes } from "../utils/ipfsUtils.js";
import { processCIDv0, processCIDv1 } from "../utils/customUtils.js";
import { checkLinkStatusAndContent } from "../utils/linkCheckUtils.js";
import { checkSafeBrowsing } from "../utils/googleSecureBrowsingAPI.js";
// Function to display the processed output of a CID
function displayProcessedOutput(inputCid, index) {
    const output0 = processCIDv0(inputCid, global.verboseMode);
    const output1 = processCIDv1(output0, global.verboseMode);
    const upperCasedOutput = output1.toUpperCase();
    const indexOfRemoval = upperCasedOutput.indexOf(": ") + 2;
    const processedOutput =
      upperCasedOutput.slice(0, indexOfRemoval) +
      upperCasedOutput.slice(indexOfRemoval + 1);
    
    return `CID ${index}: ${processedOutput}`;
  }
  
  // Controller function to get the digest hash of a CID
  export const getDigestHash = async (req, res) => {
    const { cid } = req.query;
  
    if (!cid) {
      return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
    }
  
    try {
      if (global.verboseMode) {
        console.log('getDigestHash - Start');
      }
  
      // Download file and extract hashes for the given CID
      const hashList = await downloadFileAndExtractHashes(cid, global.verboseMode);
  
      if (global.verboseMode) {
        console.log('getDigestHash - Hash List:', hashList);
      }
  
      // Process the hashes and generate the output list
      const outputList = [displayProcessedOutput(cid, 1)];
      hashList.forEach((cid, index) => {
        outputList.push(displayProcessedOutput(cid, index + 2));
      });
  
      if (global.verboseMode) {
        console.log('getDigestHash - Output List:', outputList);
      }
  
      // Send the response with the list of hash digest
      return res.json({ "List of hash digest:": outputList });
    } catch (error) {
      console.error('getDigestHash - Error:', error);
      return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
    }
  };
  
  // Controller function to list all CIDs in a file
  export const listCIDs = async (req, res) => {
    const { cid } = req.query;
  
    if (!cid) {
      return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
    }
  
    try {
      if (global.verboseMode) {
        console.log('listCIDs - Start');
      }
  
      // Download file and extract hashes for the given CID
      const hashList = await downloadFileAndExtractHashes(cid, global.verboseMode);
  
      if (global.verboseMode) {
        console.log('listCIDs - Hash List:', hashList);
      }
  
      // Generate the output list of all CIDs
      const outputList = [`CID 1: ${cid}`];
      hashList.forEach((cid, index) => {
        outputList.push(`CID ${index + 2}: ${cid}`);
      });
  
      if (global.verboseMode) {
        console.log('listCIDs - Output List:', outputList);
      }
  
      // Send the response with the list of hashes
      return res.json({ "List of hashes:": outputList });
    } catch (error) {
      console.error('listCIDs - Error:', error);
      return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
    }
  };
  
  // Controller function to check the link status of a CID
export const checkLink = async (req, res) => {
  const { cid } = req.query;

  if (!cid) {
    return res.status(400).json({ error: "CID value is missing. Please provide the CID value as a query parameter." });
  }

  try {
    if (global.verboseMode) {
      console.log('checkLink - Start');
    }

    // Initialize the list with the given CID
    const hashList = [cid];

    // Download file and extract hashes for all linked CIDs
    const allHashList = await downloadFileAndExtractHashes(cid, global.verboseMode);
    hashList.push(...allHashList);

    if (global.verboseMode) {
      console.log('checkLink - All Hash List:', hashList);
    }

    // Lists to store blocked, unsure, and legitimate links
    const blockedLinks = [];
    const unsureLinks = [];
    const legitLinks = [];
    const googleSafeBrowsingResults = [];

    for (let index = 0; index < hashList.length; index++) {
      const _cid = hashList[index];

      if (global.verboseMode) {
        console.log('checkLink - Processing CID:', _cid);
      }

      if (global.verboseMode) {
        console.log(`checkLink - Checking Google Safe Browsing for CID ${index + 1}`);
      }

      // Check the Safe Browsing status for the current URL
      const safeBrowsingResult = await checkSafeBrowsing(`https://ipfs.io/ipfs/${_cid}`);
      if (safeBrowsingResult && safeBrowsingResult.matches && safeBrowsingResult.matches.length > 0) {
        blockedLinks.push(displayProcessedOutput(_cid, index + 1));
        googleSafeBrowsingResults.push({ cid: _cid, safeBrowsingResult });
        continue; // Skip the rest of the checks for this URL
      }

      // Check the link status and content for the current CID
      const linkStatus = await checkLinkStatusAndContent(_cid, 5, global.verboseMode); // Replace 5 with the desired timeout in seconds

      if (linkStatus === true) {
        blockedLinks.push(displayProcessedOutput(_cid, index + 1));
      } else if (linkStatus === 'unsure') {
        unsureLinks.push(_cid);
      } else {
        legitLinks.push(_cid);
      }
    }

    if (global.verboseMode) {
      console.log('checkLink - Blocked Links:', blockedLinks);
      console.log('checkLink - Unsure Links:', unsureLinks);
      console.log('checkLink - Legit Links:', legitLinks);
      console.log('checkLink - Google Safe Browsing Results:', googleSafeBrowsingResults);
    }

    // Send the response with the lists of blocked, unsure, and legitimate links
    return res.json({
      "List of blocked IPFS links:": blockedLinks,
      "Unsure IPFS links:": unsureLinks,
      "List of legitimate IPFS links:": legitLinks,
      "Google Safe Browsing Results:": googleSafeBrowsingResults,
      totalBlocked: blockedLinks.length,
      totalUnsure: unsureLinks.length,
      totalLegit: legitLinks.length,
    });
  } catch (error) {
    console.error('checkLink - Error:', error);
    return res.status(500).json({ error: "Error while fetching the list of CIDs:", details: error });
  }
};
