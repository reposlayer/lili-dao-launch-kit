import { Connection } from "@solana/web3.js";
import { daoConfig } from "./config";

let cachedConnection: Connection | null = null;

export const getConnection = () => {
  if (!cachedConnection) {
    cachedConnection = new Connection(daoConfig.rpcUrl, "confirmed");
  }
  return cachedConnection;
};
