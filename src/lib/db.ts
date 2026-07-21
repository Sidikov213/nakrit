import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { migrateFriend, SEED_FRIENDS } from "./seed";
import type { Friend } from "./types";

const FRIENDS_KEY = "nakryt:friends";
const DATA_FILE = path.join(process.cwd(), "data", "friends.json");

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

function isServerless(): boolean {
  return Boolean(process.env.VERCEL);
}

function normalizeFriends(raw: unknown[]): Friend[] {
  return raw.map((item) => migrateFriend(item as Record<string, unknown>));
}

async function readFromFile(): Promise<Friend[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return normalizeFriends(JSON.parse(raw) as unknown[]);
  } catch {
    if (isServerless()) {
      return SEED_FRIENDS;
    }

    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(SEED_FRIENDS, null, 2));
    } catch {
      return SEED_FRIENDS;
    }

    return SEED_FRIENDS;
  }
}

async function writeToFile(friends: Friend[]): Promise<void> {
  if (isServerless()) {
    throw new Error(
      "Storage is read-only on Vercel. Connect Upstash Redis in project settings.",
    );
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(friends, null, 2));
}

export async function getFriends(): Promise<Friend[]> {
  const redis = getRedis();

  if (redis) {
    try {
      const data = await redis.get<unknown[]>(FRIENDS_KEY);
      if (data && data.length > 0) return normalizeFriends(data);

      await redis.set(FRIENDS_KEY, SEED_FRIENDS);
      return SEED_FRIENDS;
    } catch {
      return SEED_FRIENDS;
    }
  }

  return readFromFile();
}

export async function saveFriends(friends: Friend[]): Promise<void> {
  const redis = getRedis();

  if (redis) {
    await redis.set(FRIENDS_KEY, friends);
    return;
  }

  await writeToFile(friends);
}
