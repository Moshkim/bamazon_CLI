
/*create database*/
create database bamazon;

/*use the database*/
use bamazon;

/*create table for data storage*/

create table products (
    item_id int primary key not null auto_increment,
    product_name varchar(50) null,
    department_name varchar(50) null,
    price int(100) null,
    stock_quantity int(50) null
);


select * from products