-- SET client_min_messages = warning;
-- -------------------------
-- Database inbox_app
-- -------------------------
DROP DATABASE IF EXISTS inbox_app;
--
--
CREATE DATABASE inbox_app;
-- -------------------------
-- Database inbox_app_test
-- -------------------------
DROP DATABASE IF EXISTS inbox_app_test;
--
--
CREATE DATABASE inbox_app_test;
-- -------------------------
-- Role admin
-- -------------------------
DROP ROLE IF EXISTS admin;
--
--
CREATE ROLE admin WITH PASSWORD 'admin';
-- -------------------------
-- Alter Role admin
-- -------------------------
ALTER ROLE admin WITH SUPERUSER CREATEROLE CREATEDB LOGIN;
-- -------------------------
-- Database GRANT PRIVILEGES
-- -------------------------
GRANT ALL PRIVILEGES ON DATABASE inbox_app TO admin;
GRANT ALL PRIVILEGES ON DATABASE inbox_app_test TO admin;
-- -------------------------
-- Connect to inbox_app database
-- -------------------------
\c inbox_app;
-- -------------------------
-- Set Timezone
-- -------------------------
SET TIMEZONE = 'UTC';
-- -------------------------
-- Type folder_types
-- -------------------------
CREATE TYPE folder_types AS ENUM('INBOX', 'SENT', 'SPAM', 'DRAFT', 'TRASH');
-- -------------------------
-- Type label_types
-- -------------------------
CREATE TYPE label_types AS ENUM('PERSONAL', 'PRIVATE', 'COMPANY', 'IMPORTANT');
-- -------------------------
-- Type recipient_types
-- -------------------------
CREATE TYPE recipient_types AS ENUM('TO', 'CC', 'BCC', 'REPLY_TO');
-- -------------------------
-- Table users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_deactivated BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT timezone('UTC', now()),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
-- -------------------------
-- Table phones
-- -------------------------
CREATE TABLE IF NOT EXISTS phones (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(30) UNIQUE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- -------------------------
-- Table passwords
-- -------------------------
CREATE TABLE IF NOT EXISTS passwords (
  id SERIAL PRIMARY KEY,
  password TEXT NOT NULL,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- -------------------------
-- Table profile_pictures
-- -------------------------
CREATE TABLE IF NOT EXISTS profile_pictures (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(200) NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT timezone('UTC', now())
);
-- -------------------------
-- Table users_country
-- -------------------------
CREATE TABLE IF NOT EXISTS users_country (
  id SERIAL PRIMARY KEY,
  country VARCHAR(255) NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- -------------------------
-- Table blocked_users
-- -------------------------
CREATE TABLE IF NOT EXISTS blocked_users (
  id SERIAL PRIMARY KEY,
  blocked_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT timezone('UTC', now())
);
-- -------------------------
-- Table mails
-- -------------------------
CREATE TABLE IF NOT EXISTS mails (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  subject VARCHAR(300),
  message TEXT,
  created_at TIMESTAMP DEFAULT timezone('UTC', now()),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
-- -------------------------
-- Table attachments
-- -------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  file_name VARCHAR(100) NOT NULL,
  thumbnail VARCHAR(100) NOT NULL,
  file_url VARCHAR(100),
  size VARCHAR(100) NOT NULL
);
-- -------------------------
-- Table mail_folders
-- -------------------------
CREATE TABLE IF NOT EXISTS mail_folders (
  id SERIAL PRIMARY KEY,
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  folder folder_types NOT NULL,
  CONSTRAINT unique_mail_folder_user UNIQUE (mail_id, user_id, folder)
);
-- -------------------------
-- Table mail_labels
-- -------------------------
CREATE TABLE IF NOT EXISTS mail_labels (
  id SERIAL PRIMARY KEY,
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  label label_types NOT NULL,
  CONSTRAINT unique_mail_label_user UNIQUE (mail_id, user_id, label)
);
-- -------------------------
-- Table starred_mails
-- -------------------------
CREATE TABLE IF NOT EXISTS starred_mails (
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_starred BOOLEAN DEFAULT true,
  PRIMARY KEY(mail_id, user_id)
);
-- -------------------------
-- Table read_mails
-- -------------------------
CREATE TABLE IF NOT EXISTS read_mails (
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT true,
  PRIMARY KEY(mail_id, user_id)
);
-- -------------------------
-- Table deleted_mails
-- -------------------------
CREATE TABLE IF NOT EXISTS deleted_mails (
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT timezone('UTC', now()),
  PRIMARY KEY(mail_id, user_id)
);
-- -------------------------
-- Table mail_recipients
-- -------------------------
CREATE TABLE IF NOT EXISTS mail_recipients (
  id SERIAL PRIMARY KEY,
  mail_id INT NOT NULL REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  recipient_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  recipient_type recipient_types NOT NULL,
  reply_to_mail_id INT REFERENCES mails(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reply_to_recipient_id INT REFERENCES mail_recipients(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- -------------------------
-- Indexes
-- -------------------------
CREATE INDEX idx_mail_recipients_mail_id ON mail_recipients (mail_id);
CREATE INDEX idx_mail_recipients_recipient_id ON mail_recipients (recipient_id);