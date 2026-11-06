-- How a player arranges the home page (docs/home.md#arranging): the order of the
-- groups, the order of the cards in each group, the groups opened beyond one line.
-- A JSON object; new groups and cards come after the arranged ones.
ALTER TABLE users ADD COLUMN layout TEXT NOT NULL DEFAULT '{}';
