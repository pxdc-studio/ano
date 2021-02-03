"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    try {
      const user = ctx.state.user;
      const authorId = user ? user.id : -1;

      let { pageSize = 20, page = 0 } = ctx.query;

      let raw = await strapi
        .query("subscriptions")
        .model.query((q) => {
          q.where("author", authorId);
        })
        .fetchPage({
          pageSize,
          page,
          limit: pageSize,
          offset: page * pageSize,
        });

      const result = sanitizeEntity(raw, {
        model: strapi.models.subscriptions,
      });

      return {
        data: result,
        page: parseInt(page),
        totalCount: raw.pagination.rowCount,
      };
    } catch (e) {
      return { status: 400, message: "Unknown Error" };
    }
  },

  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;
    let body = ctx.request.body;
    body.author = authorId;
    delete body.id;
    try {
      await strapi.query("subscriptions").create(body);

      return { status: 200, message: "Create Subcription Successful" };
    } catch (e) {
      return { status: 400, message: "Unknow Error Create A sub" };
    }
  },

  async update(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;

    let { id } = ctx.params;
    let body = ctx.request.body;

    try {
      let isOwner = await strapi
        .query("subscriptions")
        .findOne({ id: id, author: authorId });
      if (!isOwner) {
        return {
          status: 403,
          message: "You Have No Permission to edit this record",
        };
      }
      await strapi.query("subscriptions").update({ id }, body);

      return { status: 200, message: "Update Subcription Successful" };
    } catch (e) {
      return { status: 400, message: "Unknow Error Edit A sub" };
    }
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1;

    let { id } = ctx.params;

    try {
      let isOwner = await strapi
        .query("subscriptions")
        .findOne({ id: id, author: authorId });
      if (!isOwner) {
        return {
          status: 403,
          message: "You Have No Permission to edit this record",
        };
      }
      await strapi.query("subscriptions").delete({ id });

      return { status: 200, message: "Delete Subcription Successful" };
    } catch (e) {
      return { status: 400, message: "Unknow Error Delete A sub" };
    }
  },
};
