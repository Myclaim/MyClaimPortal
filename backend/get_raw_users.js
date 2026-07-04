const mongoose = require('mongoose');
mongoose.connect('mongodb://Myclaim:Mycl%40im@ac-snd7ugc-shard-00-00.fcdwzd7.mongodb.net:27017,ac-snd7ugc-shard-00-01.fcdwzd7.mongodb.net:27017,ac-snd7ugc-shard-00-02.fcdwzd7.mongodb.net:27017/myclaim?ssl=true&replicaSet=atlas-jvkq94-shard-0&authSource=admin&appName=Cluster0').then(() => {
  mongoose.connection.db.collection('users').find({}).project({name: 1, role: 1}).toArray().then(u => {
    console.log(JSON.stringify(u, null, 2));
    process.exit(0);
  });
});
