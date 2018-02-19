// Callee is the model definition. This allows you to easily map a query to a predefined model
sequelize.query('SELECT * FROM projects', { model: Projects }).then(projects => {
  // Each record will now be a instance of Project
});


sequelize.query('SELECT * FROM projects WHERE status = :status ',
  { replacements: { status: 'active' }, type: sequelize.QueryTypes.SELECT }
).then(projects => {
  console.log(projects)
});


sequelize.query('SELECT * FROM projects WHERE status IN(:status) ',
  { replacements: { status: ['active', 'inactive'] }, type: sequelize.QueryTypes.SELECT }
).then(projects => {
  console.log(projects)
});


sequelize.query('SELECT * FROM projects WHERE status = $status',
  { bind: { status: 'active' }, type: sequelize.QueryTypes.SELECT }
).then(projects => {
  console.log(projects)
});

