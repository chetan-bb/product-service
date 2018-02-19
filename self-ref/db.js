/*
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect,
  port: dbPort

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    app.locals['dbInstance'] = sequelize
    initialiseExpressServer();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
 */
