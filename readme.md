## Posh Bot

---

Created by @fbslo

---

#### How does this bot works?

Read post: hive-post-goes-here

---

#### How to setup this bot?

I used Ubuntu 16.04 and Windows 10, but it should work on other Linux distros too.

Install Nodejs, NPM and MySQL.

Clone app: `git clone https://github.com/fbslo/posh-bot`

`cd posh-bot`

Install modules: `npm install`

Rename config file: `mv config.demo.json config.json`

Edit `config.json`, add Twitter and database credentials.

Start bot with: `node index.js`

---

MySQL tables:

Database: `posh`

```
+------------+------+------+-----+---------+-------+
| Field      | Type | Null | Key | Default | Extra |
+------------+------+------+-----+---------+-------+
| hive       | text | YES  |     | NULL    |       |
| twitter    | text | YES  |     | NULL    |       |
| time       | text | YES  |     | NULL    |       |
| human_time | text | YES  |     | NULL    |       |
+------------+------+------+-----+---------+-------+
```

```
+---------------+--------------+------+-----+---------+-------+
| Field         | Type         | Null | Key | Default | Extra |
+---------------+--------------+------+-----+---------+-------+
| id            | text         | YES  |     | NULL    |       |
| created_at    | bigint       | YES  |     | NULL    |       |
| user_id       | text         | YES  |     | NULL    |       |
| user_name     | text         | YES  |     | NULL    |       |
| score         | int          | YES  |     | NULL    |       |
| score_time    | bigint       | YES  |     | NULL    |       |
| points        | decimal(8,3) | YES  |     | NULL    |       |
| points_time   | bigint       | YES  |     | NULL    |       |
| hive_username | text         | YES  |     | NULL    |       |
| posted        | text         | YES  |     | NULL    |       |
| hive_link     | text         | YES  |     | NULL    |       |
+---------------+--------------+------+-----+---------+-------+
```
