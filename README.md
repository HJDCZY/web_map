ubuntu22.04
使用（我安装了openresty的ubuntu预编译包）
`openresty -p `pwd`/ -c conf/nginx.conf`打开网页服务器
(或者使用我写好的openresty.sh)

您需要到server/server.lua和中更改您的mysql信息
在/conf/nginx.conf中更改您lua和html文件的绝对路径
并且到client/script.js和script.js中更改您的服务器地址来使得websocket连接到您的服务器