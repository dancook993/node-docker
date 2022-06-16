const express = require("express");
const mongoose = require("mongoose");
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT,REDIS_PORT, REDIS_URL, SESSION_SECRET } = require("./config/config");
const app = express()
const cors = require("cors");
const session = require("express-session");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
    legacyMode: true,
    socket: {
        port: REDIS_PORT,
        host: REDIS_URL
    }
})

redisClient.connect().catch(console.error)

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const connectWithRetry = () => {
mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`).then(() => {
console.log("Succesfully connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
    setTimeout(connectWithRetry, 5000)
});
}

connectWithRetry();
app.enable("trust proxy");
app.use(cors({}));
app.use(session({
	store: new RedisStore({client: redisClient}),
	secret: SESSION_SECRET,
	cookie: {
		secure: false,
		resave: false,
		saveUninitialized: false,
		httpOnly: true,
		maxAge: 3000000,
	}
}))

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2> Hi There Dan!!</h2>")
    console.log("yeah it ran")
});

app.use("/api/v1/posts", postRouter);

app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port ${port}`'))
