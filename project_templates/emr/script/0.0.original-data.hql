drop table if exists orig;

create external table if not exists orig (
  id int,
  name string,
  mess string
)
row format delimited
fields terminated by ','
lines terminated by '\n'
stored as textfile
location 's3://some_out_of_the_world_bucket/'
tblproperties ("skip.header.line.count" = "1");
