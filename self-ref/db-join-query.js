function fetchProductData(dbInstance) {
    dbInstance
      .query('SELECT * FROM projects WHERE status = :status',
          {
              model: Projects,
              replacements: { status: 'active' }
          })
      .then(projects => {
        // Each record will now be mapped to the project's model.
        console.log(projects)
      })
}




User.findAndCountAll({
    include: [
        {model: Profile, where: {active: true}} // query to fk table
    ],
    limit: 3,
    where: {
        id: {
            [Op.and]: {a: 5},           // AND (a = 5)
            [Op.or]: [{a: 5}, {a: 6}],  // (a = 5 OR a = 6)
            [Op.gt]: 6,                // id > 6
            [Op.gte]: 6,               // id >= 6
            [Op.lt]: 10,               // id < 10
            [Op.lte]: 10,              // id <= 10
            [Op.ne]: 20,               // id != 20
            [Op.between]: [6, 10],     // BETWEEN 6 AND 10
            [Op.notBetween]: [11, 15], // NOT BETWEEN 11 AND 15
            [Op.in]: [1, 2],           // IN [1, 2]
            [Op.notIn]: [1, 2],        // NOT IN [1, 2]
            [Op.like]: '%hat',         // LIKE '%hat'
            [Op.notLike]: '%hat',       // NOT LIKE '%hat'
            [Op.iLike]: '%hat',         // ILIKE '%hat' (case insensitive)  (PG only)
            [Op.notILike]: '%hat',      // NOT ILIKE '%hat'  (PG only)
            [Op.overlap]: [1, 2],       // && [1, 2] (PG array overlap operator)
            [Op.contains]: [1, 2],      // @> [1, 2] (PG array contains operator)
            [Op.contained]: [1, 2],     // <@ [1, 2] (PG array contained by operator)
            [Op.any]: [2, 3]            // ANY ARRAY[2, 3]::INTEGER (PG only)
        },
        status: {
            [Op.not]: false           // status NOT FALSE
        }
    }
});


Project.findAll({order: 'title DESC'});
// yields ORDER BY title DESC



Subtask.findAll({
  order: [
    // Will escape username and validate DESC against a list of valid direction parameters
    ['title', 'DESC'],
  ],

  // Will order by max age descending
  order: sequelize.literal('max(age) DESC'),

  // Will order by max age ascending assuming ascending is the default order when direction is omitted
  order: sequelize.fn('max', sequelize.col('age')),

  // Will order by age ascending assuming ascending is the default order when direction is omitted
  order: sequelize.col('age'),

  // Will order randomly based on the dialect (instead of fn('RAND') or fn('RANDOM'))
  order: sequelize.random()
})


Project.findAll({group: 'name'});
// yields GROUP BY name



Task.findAll({ include: [ User ] }).then(tasks => {
  console.log(JSON.stringify(tasks))

  /*
    [{
      "name": "A Task",
      "id": 1,
      "createdAt": "2013-03-20T20:31:40.000Z",
      "updatedAt": "2013-03-20T20:31:40.000Z",
      "userId": 1,
      "user": {
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z"
      }
    }]
  */
});


User.findAll({
    include: [{
        model: Tool,
        as: 'Instruments',
        where: { name: { [Op.like]: '%ooth%' } }
    }]
}).then(users => {
    console.log(JSON.stringify(users))

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],

      [{
        "name": "John Smith",
        "id": 2,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],
    */
  });


// inner join to fk then fk
Company.findAll({
  include: [ { model: Division, include: [ Department ] } ],
  order: [ [ Division, Department, 'name' ] ]
});

User.findAll({
  include: [
    {model: Tool, as: 'Instruments', include: [
      {model: Teacher, include: [ /* etc */]}
    ]}
  ]
}).then(users => {
  console.log(JSON.stringify(users))

  /*
    [{
      "name": "John Doe",
      "id": 1,
      "createdAt": "2013-03-20T20:31:45.000Z",
      "updatedAt": "2013-03-20T20:31:45.000Z",
      "Instruments": [{ // 1:M and N:M association
        "name": "Toothpick",
        "id": 1,
        "createdAt": null,
        "updatedAt": null,
        "userId": 1,
        "Teacher": { // 1:1 association
          "name": "Jimi Hendrix"
        }
      }]
    }]
  */
});

User.findAll({
  include: [{
    model: Tool,
    as: 'Instruments',
    include: [{
      model: Teacher,
      where: {
        school: "Woodstock Music School"
      },
      required: false
    }]
  }]
}).then(users => {
  /* ... */
});



