-- V3__rename_desc_columns.sql
-- Rename desc columns to description to avoid using reserved keyword and fix SQL issues

ALTER TABLE items RENAME COLUMN "desc" TO description;
ALTER TABLE demands RENAME COLUMN "desc" TO description;
