module.exports = {
  apps : [{
    name: 'webtoonAI-local',
    script: './bin/www.js',
    instances: 4,
    exec_mode: "cluster",
    watch: false,
    instance_var: 'INSTANCE_ID',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 1000,
    max_memory_restart: '250M',
    env: {
      "APP": "local",
      "NODE_ENV": "local"
    }
  },{
    name: 'webtoonAI-dev',
    script: './bin/www.js',
    instances: 5,
    exec_mode: "cluster",
    watch: false,
    instance_var: 'INSTANCE_ID',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 1000,
    max_memory_restart: '250M',
    env: {
      "APP": "dev",
      "NODE_ENV": "dev"
    }
  },{
    name: 'webtoonAI-prod',
    script: './bin/www.js',
    instances: 8,
    exec_mode: "cluster",
    watch: false,
    instance_var: 'INSTANCE_ID',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 1000,
    max_memory_restart: '250M',
    env: {
      "APP": "prod",
      "NODE_ENV": "prod"
    }
  },{
    name: 'webtoonAI-prod-auto',
    script: './bin/www.js',
    instances: 4,
    exec_mode: "cluster",
    watch: false,
    instance_var: 'INSTANCE_ID',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 1000,
    max_memory_restart: '250M',
    env: {
      "APP": "prod-auto",
      "NODE_ENV": "prod-auto"
    }
  }
  ]
};
