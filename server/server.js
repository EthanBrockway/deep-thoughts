const express = require("express");
//import Apollo server
const { ApolloServer } = require("apollo-server-express");
//import typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");
const path = require("path");
const PORT = process.env.PORT || 3001;
// Create a new Apollo server and pass in our schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Create a new instance of na apollo server with the graphql schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
};
// Serve up static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`);
  });
});

startApolloServer(typeDefs, resolvers);
