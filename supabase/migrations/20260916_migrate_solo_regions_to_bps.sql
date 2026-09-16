-- Migration to convert hardcoded legacy Solo Raya region aliases to National BPS codes

-- 1. Update listings table
UPDATE listings SET region = '3372' WHERE region = 'solo';
UPDATE listings SET region = '3313' WHERE region = 'karanganyar';
UPDATE listings SET region = '3311' WHERE region = 'sukoharjo';
UPDATE listings SET region = '3312' WHERE region = 'wonogiri';
UPDATE listings SET region = '3314' WHERE region = 'sragen';
UPDATE listings SET region = '3309' WHERE region = 'boyolali';
UPDATE listings SET region = '3310' WHERE region = 'klaten';


-- 2. Update users (profiles) table
UPDATE users SET region = '3372' WHERE region = 'solo';
UPDATE users SET region = '3313' WHERE region = 'karanganyar';
UPDATE users SET region = '3311' WHERE region = 'sukoharjo';
UPDATE users SET region = '3312' WHERE region = 'wonogiri';
UPDATE users SET region = '3314' WHERE region = 'sragen';
UPDATE users SET region = '3309' WHERE region = 'boyolali';
UPDATE users SET region = '3310' WHERE region = 'klaten';
