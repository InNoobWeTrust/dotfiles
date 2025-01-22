drop table if exists tbl;

create external table if not exists tbl (
  id int,
  name string,
  mess string
)
stored as orc
location '${LOCATION}';

insert overwrite table tbl
select
  *
from
  orig;
