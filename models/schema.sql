<<<<<<< HEAD
DROP DATABASE IF EXISTS chat_n_dash;
CREATE DATABASE chat_n_dash;

DROP DATABASE IF EXISTS chat_n_dash;
CREATE DATABASE chat_n_dash;
=======
create database chat_n_dash;

use chat_n_dash;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_pw varchar(255) not null,
    last_chat TIMESTAMP 
	);
    
create table if not exists favorites (
	user_name varchar(255) not null,
    favorites varchar(255) not null
);

create table chat (
	user_1 varchar(255) not null,
    user_2 varchar(255) not null,
    msg varchar(1000) not null,
    msg_time timestamp
);
>>>>>>> b461103011b2e59494641edd174ff317a1a74282
