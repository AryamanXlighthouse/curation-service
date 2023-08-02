import { CID } from "multiformats/cid";
import { bases } from "multiformats/basics";
import { readFile } from "fs/promises";

const codecs = JSON.parse(
  await readFile(new URL("./codecs.json", import.meta.url))
);

const basesByPrefix = Object.keys(bases).reduce((acc, curr) => {
  acc[bases[curr].prefix] = bases[curr];
  return acc;
}, {});

export function decodeCID(value, verboseMode) {
  if (verboseMode) {
    console.log(`Decoding CID: ${value}`);
  }
  
  const prefix = value.substr(0, 1);
  const base = basesByPrefix[prefix];
  const cid = CID.parse(value, base);

  const decodedCid = {
    cid,
    multibase: cid.version === 0 ? bases.base58btc : base,
    multicodec: codecs[cid.code],
    multihash: {
      ...cid.multihash,
      name: codecs[cid.multihash.code].name,
    },
  };

  if (verboseMode) {
    console.log(`Decoded CID:`, decodedCid);
  }

  return decodedCid;
}

export function processCIDv0(inputCid, verboseMode) {
  if (verboseMode) {
    console.log(`Processing CIDv0: ${inputCid}`);
  }

  try {
    const data = decodeCID(inputCid, verboseMode);
    const outputCid = data.cid.toV1().toString();

    if (verboseMode) {
      console.log(`Processed CIDv0 to CIDv1: ${outputCid}`);
    }

    return outputCid;
  } catch (err) {
    console.error('Error processing CIDv0:', err);
    return { error: err.message || err };
  }
}

export function processCIDv1(inputCid, verboseMode) {
  if (verboseMode) {
    console.log(`Processing CIDv1: ${inputCid}`);
  }

  try {
    const data = decodeCID(inputCid, verboseMode);
    const encodedMultihash = `DIGEST ${data.multibase.name} MULTIBASE: ${data.multibase.encode(data.multihash.bytes)}`;

    if (verboseMode) {
      console.log(`Processed CIDv1 to encoded multihash: ${encodedMultihash}`);
    }

    return encodedMultihash;
  } catch (err) {
    console.error('Error processing CIDv1:', err);
    return { error: err.message || err };
  }
}
