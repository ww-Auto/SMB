/***********************************************************************
 
    PF_Guest >> cmp Request Process
    Process : PF_remote.js
    Writer  : JH
    Data    : 2024-03-06

    사용법
    1. cluster >> cluster_PF
       mergeReport >> S28_PF_cmp 에서 경로 및 날짜 config.js에서 변경
    2. main 터미널 연 후 PF_remote 실행
    3. PF_Guest >> cmp 순으로 순차 실행 데이터와 레포트 결과 확인

    실행 결과 예시
    1. PF_Guest = outputs/PF_Guest 폴더에서 확인가능
    2. cmp = result 폴더에서 확인가능
    
 ***********************************************************************/

// PF_Guest에서 레포트 작업까지 순차진행
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
        // async/await 함수를 이용해서 순차적으로 스크립트 실행
        await runScript('../src/cluster/cluster_PF.js');
        console.log('첫 번째 스크립트 완료');

        console.log('두 번째 스크립트 실행 중...');
        await runScript('../src/mergeReport/S28_PF_cmp.js');
        console.log('두 번째 스크립트 완료');

        console.log('모든 스크립트 완료');
    } catch(error) {
        console.error(`Error executing script : ${error}`);
    }
}

runScriptsSequentially();
