exports.addUpdateTsTrigger = (knex, tableName) => 
  knex.raw(`
    CREATE TRIGGER update_timestamp_${tableName}
    BEFORE UPDATE
    ON ${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `)