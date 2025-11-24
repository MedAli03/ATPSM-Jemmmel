"use strict";
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "ATPSM API",
    version: "1.0.0",
    description:
      "API documentation for the autism association platform (auth, enfants, PEI, évaluations, chatbot).",
  },
  servers: [
    { url: "http://localhost:" + (process.env.PORT || 4000), description: "Local" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "mot_de_passe"],
        properties: {
          email: { type: "string", example: "educateur@asso.tn" },
          mot_de_passe: { type: "string", example: "password" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              role: { type: "string", enum: ["PRESIDENT","DIRECTEUR","EDUCATEUR","PARENT"] },
              email: { type: "string" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Auth" },
    { name: "Enfants" },
    { name: "PEI" },
    { name: "Evaluations" },
    { name: "Chatbot" },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    path.join(process.cwd(), "src/routes/*.js"),
    path.join(process.cwd(), "src/controllers/*.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get("/docs.json", (_req, res) => res.json(swaggerSpec));
}

module.exports = { setupSwagger };
