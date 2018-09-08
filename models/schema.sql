use chat_n_dash;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    googleID varchar(255),
    createdAt DATETIME,
    updatedAt DATETIME
    );
    
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id1 INTEGER,
    user_id2 INTEGER,
    createdAt DATETIME,
    updatedAt DATETIME
    );
    
 CREATE TABLE histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id1 INTEGER,
    user_id2 INTEGER,
    date_matched DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME
    );   
    
create table favorites (
id INT AUTO_INCREMENT PRIMARY KEY,
    user_id1 INTEGER,
    user_id2 INTEGER,
    is_match BOOLEAN,
    createdAt DATETIME,
    updatedAt DATETIME
    )