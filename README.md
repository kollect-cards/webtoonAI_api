# WEBTOON AI API


- node version: 18.16.0
### 실행 방법
```
git reset --hard origin/main
git pull

npm install 

# 로컬 실행시
npm start 

# 개발서버 실행시 (또는 재시작)
forever stop 0
forever start -w ./bin/www-AI
forever list

```

### 주요 파일 설명

- cron/runQueue
  - 대기열에 앱에서 요청한 이미지 생성을 조회하여 순차적으로 생성 요청 후 이미지 데이터 값을 디비에 저장해둔다.
  
- controllers
  - queue
    - 앱에서 요청하는 API로 등록과 조회 두개만 있다.
    - 데이터를 SD 서버에 처리 요청할수 있도록 등록한다.
    - 이미지 생성이 완료된 데이터는 사용자가 조회할수 있도록 한다.
  - test
    - 파이어베이스 데이터스토어 또는 SD 서버와 통신하는 테스트 API가 있다.
    - SD 서버에 여러 변수값을 조정하여 이미지 생성 테스트를 할 수 있다.

### 코드 배포 방법
1. 내부 소스 코드 수정후 git commit / push 
2. 터미널 프로그램을 이용하여 서버 접속
```
ssh -i /{key.pem path}/kollect-key.pem ubuntu@43.201.196.118
# .pem file 의 권한 400 인지 체크 
```
3. 접속 후 AI 프로젝트로 이동 및 git pull
```
cd webtoonAI_api/
git pull origin main
# 만약 코드 충돌이 일어난다면: git reset --hard origin main
```
4. tail -f log 로 배포 로그 확인 