#!/bin/bash
#rm ./build/* -rf
#ant war
#sudo rm /var/lib/tomcat6/webapps/beta* -r
#sudo cp ./build/beta.war /var/lib/tomcat6/webapps/
sudo service tomcat6 restart
