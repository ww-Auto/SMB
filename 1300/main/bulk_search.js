const { spawn } = require('child_process');

function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        const script = spawn('node', [scriptPath], { shell: true });
        script.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        script.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        script.on('close', (code) => {
            if (code === 0) {
                resolve(`Script ${scriptPath} completed successfully.`);
            } else {
                reject(`Script ${scriptPath} exited with code ${code}.`);
            }
        });
    });
}

async function runScriptsSequentially() {
    try {
        console.log('첫 번째 스크립트 실행 중...');
        await runScript('../../1200/api_bulk.js');
        console.log('첫 번째 스크립트 완료.');

        console.log('두 번째 스크립트 실행 중...');
        await runScript('../../1200/api_search.js');
        console.log('두 번째 스크립트 완료.');

        console.log('세 번째 스크립트 실행 중...');
        await runScript('../src/mergeReport/S28_api_cmp.js');
        console.log('세 번째 스크립트 완료.');

        console.log('모든 스크립트 실행 완료.');
    } catch (error) {
        console.error(`Error executing script: ${error}`);
    }
}

runScriptsSequentially();
