import { allowedOriginRepository } from "../src/app/repositories/allowed-origin.repository";


let allowedOriginsCache: string[] = [];

const allowedOriginRepo = allowedOriginRepository;

export async function loadAllowedOrigins() {
  const all = await allowedOriginRepo.find();
  allowedOriginsCache = all.map(o => o.origin);
}