// cypress.config.js
const { defineConfig } = require("cypress");
const crypto = require("crypto");
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:5106",
    setupNodeEvents(on, config) {
      on("task", {
        generateDigest(input) {
          const hash = crypto.createHash("sha256").update(input).digest("hex");
          return "0x" + hash;
        },
      });
      return config;
    },
  },
});
