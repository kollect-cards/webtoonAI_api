#!/bin/bash

git reset --hard origin/1.5.0
git pull

forever stop 0

# 현재 일시 얻기
current_date=$(date '+%Y%m%d_%H%M%S')
log_path="/home/ubuntu/webtoonAI_api/logs"

# Forever 시작
forever start -e "$log_path/ERR_$current_date.log" -l "$log_path/LOG_$current_date.log" -w ./bin/www.js
forever list
clear
tail -f $log_path/LOG_$current_date.log
