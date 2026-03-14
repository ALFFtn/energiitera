"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_js_1 = require("./errorHandler.js");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => e.message).join(', ');
                return next(new errorHandler_js_1.AppError(`Validation error: ${messages}`, 400));
            }
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map