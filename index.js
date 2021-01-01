const concurrently = require("concurrently");

const success = () => {
	console.log("Started successfully");
};

const failure = () => {
	console.error("Something went wrong");
};

concurrently([{ command: "npm run build && npm run start", name: "nextjs" }], {
	prefix: "name",
	killOthers: ["failure", "success"],
	restartTries: 3,
}).then(success, failure);
