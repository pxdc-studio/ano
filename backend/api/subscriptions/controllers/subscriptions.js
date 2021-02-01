"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;
    let raw = await strapi.query("subscriptions").findOne({
      user: authorId,
    });

    const result = sanitizeEntity(raw, { model: strapi.models.subscriptions });
    return result;
  },
  async create(ctx) {
    await strapi.query("subscriptions").create({
      author: 1,
      tags: [],
    });
  },
};
