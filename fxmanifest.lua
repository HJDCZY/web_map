-- 模组配置文件
fx_version "adamant"
game "gta5"

name 'web_map'
author 'HJDCZY'
description 'A wen map used with nginx server which can se the server map out of the game'
version'1.0.0'

client_scripts{
    'client.lua',
}
server_scripts{
    'server.lua',
    '@mysql-async/lib/MySQL.lua',
}
ui_page 'index.html'
-- script 'script.js'
files{
    'index.html',
    'script.js'
}