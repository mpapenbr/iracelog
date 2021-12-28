module.exports = {
  resolve: {
    fallback: { 
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),

    }
  }
}