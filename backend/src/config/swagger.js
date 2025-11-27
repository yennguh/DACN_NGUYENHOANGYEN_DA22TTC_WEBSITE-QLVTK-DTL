import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Lost and Found API",
            version: "1.0.0",
            description: "API documentation for Lost and Found Management System",
        },
        servers: [
            {
                url: "http://localhost:8017/v1",
                description: "Local server",
            },
        ],
    },
    // 👇 Dùng path.resolve để đảm bảo tìm đúng file. Scan routes, controllers and models for JSDoc/OpenAPI comments
    apis: [
        path.resolve(__dirname, "../routes/**/*.js"),
        path.resolve(__dirname, "../controllers/**/*.js"),
        path.resolve(__dirname, "../models/**/*.js"),
    ],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
