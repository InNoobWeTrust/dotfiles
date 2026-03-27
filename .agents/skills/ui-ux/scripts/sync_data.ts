#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";

/**
 * UI-UX Skill Data Synchronizer
 *
 * This script dynamically discovers and syncs design data from multiple curated sources.
 * It uses the GitHub API to explore directories and fetch all relevant CSV/JSON files,
 * ensuring the local cache evolves automatically as the sources change.
 */

interface SourceConfig {
  name: string;
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

const SOURCES: SourceConfig[] = [
  {
    name: "ui-ux-pro-max",
    owner: "nextlevelbuilder",
    repo: "ui-ux-pro-max-skill",
    path: "cli/assets/data",
    branch: "main"
  }
  // Add more sources here in the future
];

const CACHE_DIR = process.env.UI_UX_CACHE || join(process.env.HOME || "/tmp", ".cache/ui-ux-skill");

async function fetchGitHubDirectory(owner: string, repo: string, path: string, branch: string): Promise<any[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to list directory ${path}: ${response.statusText}`);
  }

  return await response.json();
}

function parseCSV(csv: string) {
  const lines = csv.split("\n").filter(line => line.trim() !== "");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || "";
    });
    return obj;
  });
}

async function syncSource(source: SourceConfig) {
  console.log(`\n--- Syncing Source: ${source.name} ---`);

  async function processDirectory(currentPath: string, localSubDir: string) {
    const items = await fetchGitHubDirectory(source.owner, source.repo, currentPath, source.branch);

    for (const item of items) {
      if (item.type === "dir") {
        await processDirectory(item.path, join(localSubDir, item.name));
      } else if (item.type === "file") {
        const isCSV = item.name.endsWith(".csv");
        const isJSON = item.name.endsWith(".json");

        if (isCSV || isJSON) {
          const targetPath = join(CACHE_DIR, source.name, localSubDir, item.name.replace(".csv", ".json"));
          await mkdir(dirname(targetPath), { recursive: true });

          console.log(`Syncing ${item.name}...`);
          const fileResponse = await fetch(item.download_url);
          if (!fileResponse.ok) {
            console.error(`Failed to download ${item.name}`);
            continue;
          }

          let content;
          if (isCSV) {
            const csvText = await fileResponse.text();
            content = JSON.stringify(parseCSV(csvText), null, 2);
          } else {
            const jsonText = await fileResponse.text();
            content = jsonText; // Already JSON
          }

          await writeFile(targetPath, content);
        }
      }
    }
  }

  await processDirectory(source.path, "");
}

async function main() {
  console.log(`Starting UI-UX data sync to ${CACHE_DIR}...`);
  for (const source of SOURCES) {
    try {
      await syncSource(source);
    } catch (error) {
      console.error(`Error syncing source ${source.name}:`, error);
    }
  }
  console.log("\nAll sources synced successfully.");
}

main();
