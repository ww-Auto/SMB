// bulk >> search >> 레포트 순으로 스크립트 순차진행
const { spawn } = require('child_process');

function runScript(scriptPath) {
    // 비동기 작업인 자식 프로세스를 실행 관리하는 핵심 역할(Promise)
    return new Promise((resolve, reject) => {

        // spawn 외부 스크립트 실행
        const script = spawn('node', [scriptPath], { shell: true });
        script.stdout.on('data', (data) => {
            // 실행중인 스크립트 터미널에 표시
            console.log(`stdout: ${data}`);
        });

        script.stderr.on('data', (data) => {
            // 실행중인 스크립트 에러시 터미널에 표시
            console.error(`stderr: ${data}`);
        });

        // 스크립트 종료되었을때 성공과 실패시 결과 표시
        script.on('close', (code) => {
            if(code === 0) {
                resolve(`Script ${scriptPath} completed successfully`);
            } else {
                reject(`Script ${scriptPath} exited with code ${code}`);
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
