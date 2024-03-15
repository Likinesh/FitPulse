--calories table--
CREATE TABLE workout(
workout_id BIGSERIAL INT,
username VARCHAR,
duration TIME NOT NULL,
activity VARCHAR,
act_date DATE,
cal FLOAT

);

--DELETE ACTIVITY--
DELETE FROM workout WHERE workout_id=$1,
[workout_id]


--ADD ACTIVITY--
INSERT INTO workout(username,duration,activity,act_date)=($1,$2,$3,$4)
[user,dur,activity,Date.now]

