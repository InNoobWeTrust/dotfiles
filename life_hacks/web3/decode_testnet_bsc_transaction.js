#!/usr/bin/env -S deno run --allow-read --allow-env --allow-net

/**
 * Decode testnet BSC transaction
 * Requirements:
 * 	- Install deno: `brew install deno`
 * 	- Put abi.json file in the same directory
 * 	- Give this file executable permission: `chmod +x decode_testnet_bsc_transaction.js`
 * 	Usage:
 * 		```shell
 * 		./decode_testnet_bsc_transaction.js <transaction-hash>
 * 		```
 */

import { ethers } from "npm:ethers@5.6.9";
import ABI from "./abi.json" assert { type: "json" }; // Contract ABI

const provider = ethers.getDefaultProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
);
const iface = new ethers.utils.Interface(ABI);
(async () => {
  const tx = await provider.getTransaction(Deno.args[0]);
  const decodedInput = iface.parseTransaction({
    data: tx.data,
    value: tx.value,
  });

  // Decoded Transaction
  console.log(JSON.stringify(decodedInput, null, 2));
})();
