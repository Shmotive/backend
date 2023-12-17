#!/bin/bash

npx sequelize model:generate --name User --attributes uuid:string,username:string,current_session_uuid:string,deleted_at:date --underscored 

npx sequelize model:generate --name MotiveSession --attributes lobby_code:string,state:string,owner:string --underscored 

npx sequelize model:generate --name MotiveSessionHistory --attributes user_uuid:string,session_id:string,joined_at:date,completed_at:date --underscored 

npx sequelize model:generate --name Recommendation --attributes name:string,category:string,price_range:array:integer --underscored 

npx sequelize model:generate --name Vote --attributes user_uuid:string,session_id:string,recommendation_id:string,vote:boolean --underscored 