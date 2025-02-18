#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';
import path from 'path';

const currentFilePath = fileURLToPath(import.meta.url);
const thisDir = path.dirname(currentFilePath);
const releasesDir = path.join(thisDir, 'releases');

async function getJsonFromURL(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'avalanche-docs-version-checker',
                'Accept': 'application/json'
            }
        };

        const request = https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        throw new Error(`HTTP ${res.statusCode}: ${data}`);
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}. Data: ${data.substring(0, 100)}...`));
                }
            });
        });

        request.setTimeout(3000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });

        request.on('error', reject);
    });
}

async function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                downloadFile(response.headers.location)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);

        request.setTimeout(3000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function processReleases() {
    try {
        // Create releases directory if it doesn't exist
        if (!fs.existsSync(releasesDir)) {
            fs.mkdirSync(releasesDir, { recursive: true });
        }

        const releases = await getJsonFromURL('https://api.github.com/repos/ava-labs/icm-contracts/releases');

        for (const release of releases) {
            const releaseData = {};

            for (const asset of release.assets) {
                const filename = path.basename(asset.browser_download_url);
                console.log(`Downloading ${filename}...`);
                const content = await downloadFile(asset.browser_download_url);
                releaseData[filename] = content;
            }

            const jsonPath = path.join(releasesDir, `${release.tag_name}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(releaseData, null, 2));
            console.log(`Created ${jsonPath}`);
        }

        console.log('All release JSONs created successfully');
    } catch (error) {
        console.error('Error processing releases:', error);
    }
}

// Execute the process
processReleases();
