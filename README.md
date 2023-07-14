# TEST API

```
git reset --hard origin/1.0.0
git pull

# 개발서버 
forever stop 0
forever start -w ./bin/www.js
forever list

```

- 모듈 정리
```
# `node_modules` 디렉토리에서 `package.json`에 정의되지 않은 모듈을 모두 삭제
npm prune

# 중복 모듈 삭제
npm dedupe

# 모듈 폴더 삭제
npm install rimraf
rimraf node_modules

```