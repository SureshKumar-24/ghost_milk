-- Add shift field to milk_entries table
ALTER TABLE milk_entries ADD COLUMN shift TEXT CHECK (shift IN ('morning', 'evening'));

-- Set default for existing records
UPDATE milk_entries SET shift = 'morning' WHERE shift IS NULL;

-- Make shift required for new records
ALTER TABLE milk_entries ALTER COLUMN shift SET NOT NULL;

-- Update unique constraint to allow multiple entries per customer per day (different shifts)
-- No unique constraint needed - customers can have multiple entries per day with different shifts
