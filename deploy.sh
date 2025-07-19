#!/usr/bin/expect -f

set timeout 120

spawn ssh root@192.168.50.10
expect "*assword:"
send "Stanford123wannabe!\r"
expect "root@*"

# Navigate to app directory and pull latest changes
send "pct exec 110 -- bash -c 'cd /opt/vim-trainer && git pull origin main'\r"
expect "root@*"

# Stop, rebuild, and restart the app
send "pct exec 110 -- bash -c 'cd /opt/vim-trainer && docker compose down'\r"
expect "root@*"

send "pct exec 110 -- bash -c 'cd /opt/vim-trainer && docker compose up -d --build'\r"
expect "root@*"

send "sleep 15\r"
expect "root@*"

send "echo 'Deployment complete! App available at http://192.168.50.254:3000'\r"
expect "root@*"

send "exit\r"
expect eof