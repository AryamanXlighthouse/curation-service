import fetch from "node-fetch";

// Function to download a file from IPFS and extract hashes
export async function downloadFileAndExtractHashes(CID, verboseMode) {
  const baseURL = 'https://ipfs.io/ipfs/';
  const url = `${baseURL}${CID}?format=dag-json`;
  let timeoutInMs = 5000

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutInMs);

  try {
    if (verboseMode) {
      console.log(`Fetching content from URL: ${url}`);
    }

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Warning: Unable to fetch DAG-JSON for CID '${CID}' from IPFS. Response status: ${response.status}`);
      return [];
    }

    const fileContent = await response.text();
    const parsedContent = JSON.parse(fileContent);
    const linkedHashes = parsedContent.Links.map(link => link.Hash['/']);

    if (verboseMode) {
      console.log(`Response received for CID '${CID}'. Extracted hashes:`, linkedHashes);
    }

    // Recursively fetch and merge all linked hashes
    const linkedHashLists = await Promise.all(linkedHashes.map(hash => downloadFileAndExtractHashes(hash, verboseMode, timeoutInMs)));
    const hashList = [...linkedHashes, ...linkedHashLists.flat()];

    return hashList;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      console.warn(`Warning: Timeout while fetching CID '${CID}'`);
      return [];
    } else {
      console.error('Error while downloading or processing the file:', error);
      return [];
    }
  }
}
