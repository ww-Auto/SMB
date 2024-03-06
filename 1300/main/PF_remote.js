/***********************************************************************
 
    Search_bulk_cmp Request Process
    Process : api_remote
    Writer  : JH
    Data    : 2024-03-06

    사용법
    1. 1200 >> api_bulk, api_search 
       mergeReport >> S28_api_cmp 경로 및 날짜 config.js에서 확인 및 bulk 쿠키값 확인
    2. main 터미널 연 후 api_remote 실행
    3. bulk >> search >> cmp 순으로 순차 실행 데이터와 레포트 결과 확인

    실행 결과 예시
    1. bulk, search = outputs/api/bulk, search 폴더에서 확인가능
    2. cmp = result 폴더에서 확인가능
    
 ***********************************************************************/

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
