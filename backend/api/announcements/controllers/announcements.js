"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  async find(ctx) {
    let raw = await strapi
      .query("announcements")
      .find({ _limit: 20, _sort: "published_at:desc" });
    return raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.announcements })
    );
  },
  async findByUser(ctx) {
    let raw = await strapi
      .query("announcements")
      .find({ _limit: 20, _sort: "published_at:desc", author: ctx.params.id });
    return raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.announcements })
    );
  },
  async create(ctx) {
    let { title, message, tags, resources } = ctx.request.body;
    console.log({
      title,
      message,
      tags,
      resources,
    });
    return { status: 200 };

    // strapi.query("announcements")
  },
};
