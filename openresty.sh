#/bin/bash

#获取文件绝对路径
#!/bin/bash

# 获取脚本的绝对路径
SCRIPT_DIR=$(dirname $(readlink -f $0))

echo $SCRIPT_DIR
openresty -p $SCRIPT_DIR/ -c conf/nginx.conf