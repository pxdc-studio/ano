"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async autocomplete(ctx) {
    let { slug } = ctx.params;

    let raw = await strapi
      .query("user", "users-permissions")
      .model.query((q) => {
        q.where("username", "LIKE", `${slug}%`);
        q.orWhere("email", "LIKE", `${slug}%`);
      })
      .fetchAll();

    //custom santitize -- currently have not found document to sanitize users model from strapi
    raw = raw.toJSON();
    const result = raw.map((item) => ({
      email: item.email,
      username: item.username,
      id: item.id,
    }));
    return result;
  },
};
