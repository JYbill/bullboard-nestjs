#!/bin/bash
push_to_aliyun=true
platform=x86
while getopts ":p:s" opt
do
  case $opt in
    p ) platform=$OPTARG;;
    s ) push_to_aliyun=false;;
    * ) echo "wrong paramters"
      exit 1;;
  esac
done
shift $(($OPTIND - 1))

branch_name=`git branch --show-current | tr '/' '_'`
commit_id=`git rev-parse --short=10 HEAD`
tag_id=`git describe --tags --abbrev=0`
docker_tag="${platform}_${branch_name}_${commit_id}_${tag_id}"
echo "docker version:${docker_tag}"

service_name="bullboard"
docker build --progress=plain -f "${platform}.Dockerfile" -t ${service_name} .
image_id=`docker images ${service_name} | awk '{ print $3 }' | sed -n '2p'`
echo "image_id:${image_id}"

echo "docker_tag:${docker_tag}"
if [[ "$push_to_aliyun" == "true" ]]; then
  echo "docker start push"
  # 内网(nexus docker私有化仓库)
  docker login --username=public --password=123456 192.168.88.115:8082
  docker tag ${image_id} 192.168.88.115:8082/${service_name}:${docker_tag}
  docker push 192.168.88.115:8082/${service_name}:${docker_tag}
  # 外网
  # ...
  if [ $? -ne 0 ]; then
    echo "docker push fail!"
    exit 1
  fi
  echo "docker push done!"
else
  echo "docker start save"
  docker save ${image_id} -o images.tar
  echo "docker start done!"
fi
