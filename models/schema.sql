create database chat_n_dash;

use chat_n_dash;

CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    googleId varchar(255);
	);
    
create table if not exists favorite (
	user_name varchar(255) not null,
    favorites varchar(255) not null
);

create table chat (
	user_1 varchar(255) not null,
    user_2 varchar(255) not null,
    msg varchar(1000) not null,
    msg_time timestamp
);
