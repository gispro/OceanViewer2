#!/bin/bash

#deploy config
version=0.4.6
build_project_name=beta
build_dir=./build
config_dir=./deploy/static_config

#server config
source $config_dir/$1.sh

#deploing...
build_project_dir=$build_dir/$build_project_name
project_dir=$webapps/$project_name
user_server=$user@$server

rm $build_dir/$build_project_name -rf
ant war
##rsync -e ssh --progress -lvr --delete-after $build_project_dir $user_server:$webapps/
content="var content = fs.read(\"$project_dir/WEB-INF/web.xml\"); //SED"
cat $build_project_dir/WEB-INF/app/configurator.js | sed -e "s,^.*SED$,$content," > $build_project_dir/WEB-INF/app/.temp_configurator.js
mv $build_project_dir/WEB-INF/app/.temp_configurator.js $build_project_dir/WEB-INF/app/configurator.js
cp $config_dir/$client_config $build_project_dir/WEB-INF/app/static/config.js
cp $config_dir/$wms_config $build_project_dir/WEB-INF/app/static/wms.json
cd $build_project_dir
jar cf ../$project_name-$server-$version.war *
cd -
if [[ $2 == send ]]; then
  ssh $user_server "rm $project_dir -r"
  ssh $user_server "rm $project_dir.war"
  scp $build_dir/$project_name-$server-$version.war $user_server:$project_dir.war
fi
