import fetch from "node-fetch";

export async function checkLinkStatusAndContent(cid, timeoutSeconds, verboseMode) {
  const link = `https://ipfs.io/ipfs/${cid}`
  try {
    if (verboseMode) {
      console.log(`Checking link status for CID: ${cid}`);
    }

    const responsePromise = fetch(link, { method: 'HEAD' });
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'));
      }, timeoutSeconds * 1000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (verboseMode) {
      console.log(`Received status code ${response.status} for CID: ${cid}`);
    }

    if (response.status === 410) {
      return true;
    }

    return false;
  } catch (error) {
    if (verboseMode) {
      console.log(`Error occurred while checking link for CID: ${cid}`);
    }

    if (error.message === 'Timeout') {
      return 'unsure';
    } else {
      console.error(`Error while checking the link ${link}:`, error.message);
      return false;
    }
  }
}
