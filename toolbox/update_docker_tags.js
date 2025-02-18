import https from 'https';
import fs from 'fs';
import path from 'path';

function readVersionsFile() {
    const versionsPath = path.join('src', 'versions.json');
    const content = fs.readFileSync(versionsPath, 'utf8');
    return JSON.parse(content);
}

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

async function fetchDockerTag() {
    const data = await getJsonFromURL('https://hub.docker.com/v2/repositories/avaplatform/subnet-evm/tags?page_size=1000');
    const semanticTags = data.results
        .map(tag => tag.name)
        .filter(name => /^v\d+\.\d+\.\d+$/.test(name));

    if (semanticTags.length > 0) {
        return semanticTags[0];
    }
    throw new Error('No semantic version tags found');
}

async function main() {
    try {
        const versions = readVersionsFile();
        const [latestDockerTag] = await Promise.all([
            fetchDockerTag(),
        ]);

        let hasUpdates = false;
        if (latestDockerTag !== versions['docker:avaplatform/subnet-evm']) {
            versions['docker:avaplatform/subnet-evm'] = latestDockerTag;
            console.error(`New subnet-evm version ${latestDockerTag} is available`);
            hasUpdates = true;
        }

        if (hasUpdates) {
            fs.writeFileSync('src/versions.json', JSON.stringify(versions, null, 2));
            console.error('Please run `node toolbox/update_docker_tags.js` and commit the changes');
            process.exit(1);
        }

        console.log('All release versions are up to date in update_docker_tags.js');
    } catch (error) {
        console.warn('Warning:', error.message);
        process.exit(0);
    }
}

main();
