const User = require('./User');
const Collection = require('./Collection');
const Achievement = require('./Achievement');
const Photo = require('./Photo');

// User relationships
User.hasMany(Collection, {
  foreignKey: 'userId',
  as: 'collections'
});

Collection.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Achievement, {
  foreignKey: 'userId',
  as: 'achievements'
});

Achievement.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Photo);
Photo.belongsTo(User);

// Collection relationships
Collection.hasMany(Photo);
Photo.belongsTo(Collection);

module.exports = {
  User,
  Collection,
  Achievement,
  Photo
}; 