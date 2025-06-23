const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {places,descriptors} = require('./seedHelper');
const cities = require('./cities');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error: "));
db.once("open",() => {
    console.log("Database connected");
})

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];



const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 300; i++){
        let rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
          //YOUR USER ID
            author:'66e6832d3bf99947ed7396dd',
            location:`${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus explicabo modi pariatur a vel fugiat molestiae tenetur esse expedita aspernatur ipsum, maxime officia debitis odio provident distinctio placeat eos rerum?",
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[rand].longitude,
                  cities[rand].latitude,
              ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dp0ogwady/image/upload/v1727325170/YelpCamp/ybq6mb2omfp9c0wskpoz.jpg',
                  filename: 'YelpCamp/tcehxv7lfkbamsw2zbld',
                },
                {
                  url: 'https://res.cloudinary.com/dp0ogwady/image/upload/v1726977847/YelpCamp/jmyq2651buiivn9p1ou7.jpg',
                  filename: 'YelpCamp/ayy4mzahm3ngam69sblv',
                },
              ],
        });
        await camp.save();
    }
}
seedDB()
.then(() => {
    console.log("It worked then close");
    mongoose.connection.close()
})