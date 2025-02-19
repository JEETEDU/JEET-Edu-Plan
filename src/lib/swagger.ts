import {createSwaggerSpec} from "next-swagger-doc";

export const getApiDocs = async () => {
    return createSwaggerSpec({
    apiFolder: "./src/app/(others)/api",
        definition: {
            openapi: "3.0.0",
            info: {
                    title: "API Documentation",
                version: "1.0.0",
            }
        }
    });
}