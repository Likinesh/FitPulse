<<<<<<< HEAD
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

=======
--CALORIES TABLE--
CREATE TABLE workout(
    workout_id BIGSERIAL INT,
    username VARCHAR,
    duration TIME NOT NULL,
    activity VARCHAR ,
    act_date DATE,
    cal FLOAT 
)

--DELETE Activity--
DELETE FROM workout WHERE workout_id=$1,
[workout_id]

--ADD acitivity--
INSERT INTO workout(username,duration,activity,act_date,cal) VALUES ($1,$2,$3,$4,$5),
    [user,dur,activity,Date.now,cal]

--
>>>>>>> a3db696e7fe082def8e7dfe26da0e2c1a8d53a81