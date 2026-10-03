-- Expense Tracker: database schema
-- Run this file once to create the table and add some sample data.
-- Running it again deletes the table and starts from the sample data.

DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
  id       SERIAL PRIMARY KEY,
  title    VARCHAR(100)  NOT NULL CHECK (btrim(title) <> ''),
  amount   NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(20)   NOT NULL CHECK (category IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Other')),
  date     DATE          NOT NULL
);

INSERT INTO expenses (title, amount, category, date) VALUES
  ('Lunch',            4.50,  'Food',          '2026-01-15'),
  ('Bus ticket',       1.20,  'Transport',     '2026-01-15'),
  ('Electricity bill', 32.00, 'Bills',         '2026-01-18'),
  ('Cinema',           8.00,  'Entertainment', '2026-01-20'),
  ('Notebook',         2.50,  'Other',         '2026-01-22'),
  ('Groceries',        27.75, 'Food',          '2026-02-02'),
  ('Taxi',             6.00,  'Transport',     '2026-02-04'),
  ('Internet bill',    20.00, 'Bills',         '2026-02-07');


INSERT INTO expenses (title, amount, category, date) VALUES
  ('Coffee',              3.75,  'Food',          '2026-02-10'),
  ('Train pass',          45.00, 'Transport',     '2026-02-12'),
  ('Water bill',          15.50, 'Bills',         '2026-02-14'),
  ('Concert ticket',      55.00, 'Entertainment', '2026-02-16'),
  ('Batteries',           4.20,  'Other',         '2026-02-18'),
  ('Dinner out',          22.00, 'Food',          '2026-02-20'),
  ('Parking fee',         5.00,  'Transport',     '2026-02-21'),
  ('Phone bill',          28.00, 'Bills',         '2026-02-25'),
  ('Streaming service',   12.99, 'Entertainment', '2026-02-27'),
  ('Umbrella',            9.00,  'Other',         '2026-03-01'),
  ('Rent utilities',      60.00, 'Bills',         '2026-03-06'),
  ('Bowling night',       18.00, 'Entertainment', '2026-03-08'),
  ('Book',                14.50, 'Other',         '2026-03-10'),
  ('Breakfast',           6.25,  'Food',          '2026-03-12'),
  ('Museum entry',        11.00, 'Entertainment', '2026-03-18'),
  ('Stationery',          7.30,  'Other',         '2026-03-20'),
  ('Takeout pizza',       16.90, 'Food',          '2026-03-22'),
  ('Video game',          49.99, 'Entertainment', '2026-03-27'),
  ('Gift wrap',           3.00,  'Other',         '2026-03-29'),
  ('Farmers market',      19.50, 'Food',          '2026-04-01'),
  ('Subway pass',         42.00, 'Transport',     '2026-04-03'),
  ('Theater show',        65.00, 'Entertainment', '2026-04-08'),
  ('Phone case',          12.00, 'Other',         '2026-04-10'),
  ('Sushi dinner',        28.50, 'Food',          '2026-04-12'),
  ('Taxi',                7.20,  'Transport',     '2026-04-14'),
  ('Arcade',              15.00, 'Entertainment', '2026-04-18');