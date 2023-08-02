import fetch from "node-fetch";

// Function to check if a link is blocked
export async function checkLinkStatusAndContent(cid, timeoutSeconds) {
  const link = `https://ipfs.io/ipfs/${cid}`
  try {
    const responsePromise = fetch(link, { method: 'HEAD' });

    // Create a timeout promise
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'));
      }, timeoutSeconds * 1000);
    });

    // Use Promise.race() to handle the case when the request takes longer than timeoutSeconds
    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (response.status === 410) {
      return true;
    }

    return false;
  } catch (error) {
    if (error.message === 'Timeout') {
      // The request took longer than timeoutSeconds
      return 'unsure';
    } else {
      console.error(`Error while checking the link ${link}:`, error.message);
      return false;
    }
  }
}
