Post.findAll({
  where: {
    authorId: 12,
    status: 'active'
  }
});
// SELECT * FROM post WHERE authorId = 12 AND status = 'active';


Post.findAll({
  where: {
    [Op.or]: [{authorId: 12}, {authorId: 13}]
  }
});
Post.findAll({
  where: {
    authorId: {
      [Op.or]: [12, 13]
    }
  }
});
// SELECT * FROM post WHERE authorId = 12 OR authorId = 13;


// Find all projects with a least one task where task.state === project.state
Project.findAll({
    include: [{
        model: Task,
        where: { state: Sequelize.col('project.state') }
    }]
});



// Skip 5 instances and fetch the 5 after that
Project.findAll({ offset: 5, limit: 5 })


















