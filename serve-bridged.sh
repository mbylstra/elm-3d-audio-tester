IP_ADDRESS=`ifconfig eth0 | grep "inet addr" | cut -d ':' -f 2 | cut -d ' ' -f 1`
webpack-dev-server --host=$IP_ADDRESS --hot --inline --content-base src/
