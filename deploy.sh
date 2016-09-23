BRANCH=`git rev-parse --abbrev-ref HEAD`
scp -r dist/* "michaelbylstra@linode:~/static/web-audio-spatialisation/${BRANCH}"
