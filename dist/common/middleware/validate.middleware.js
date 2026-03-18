"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = ({ body, params, query }) => (req, _res, next) => {
    try {
        if (body) {
            req.body = body.parse(req.body);
        }
        if (params) {
            req.params = params.parse(req.params);
        }
        if (query) {
            req.query = query.parse(req.query);
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.validate = validate;
