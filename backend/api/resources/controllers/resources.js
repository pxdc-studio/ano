"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const { createTags, createResources } = strapi.config.functions["common"];

const slugify = require("slugify");

module.exports = {
  async autocomplete(ctx) {
    let { name } = ctx.params;

    let raw = await strapi
      .query("resources")
      .model.query((q) => {
        q.where("resources.name", "LIKE", `${name}%`);
        q.orderBy("created_at", "desc");
      })
      .fetchAll();

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.resources })
    );
    return result;
  },
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { pageSize = 20, page = 0 } = ctx.query;
    let raw = await strapi
      .query("resources")
      .model.query((q) => {
        q.where("resources.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
        limit: pageSize,
        offset: page * pageSize,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.resources })
    );

    return {
      data: result,
      page: parseInt(page),
      totalCount: raw.pagination.rowCount,
    };
  },
  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id
    const { name, url } = ctx.request.body;

    try {
      let result = await strapi.query("resources").create({
        name: name,
        author: authorId,
        url: url,
      });

      return {
        status: 200,
        data: result,
        message: "Resource created successful",
      };
    } catch (e) {
      return { status: 400, message: "Unknowned Error when create Resource" };
    }
  },
  async delete(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id: resource_id } = ctx.params;

    try {
      const isInUse = await strapi.query("announcements").findOne({
        resources: resource_id,
      });

      if (isInUse) {
        return { status: 304, message: "Resource is in use" }; // inuse
      }

      await strapi
        .query("resources")
        .model.query((q) => {
          q.where("resources.author", authorId);
          q.andWhere("resources.id", resource_id);
        })
        .destroy();

      return { status: 200, message: "Resource delete successful" };
    } catch (e) {
      return { status: 400, message: "Unknow Error while resource delete" };
    }
  },
  async update(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id: resource_id } = ctx.params;
    let { url, name } = ctx.request.body;

    try {
      await strapi
        .query("resources")
        .model.query((q) => {
          q.where("resources.author", authorId);
          q.andWhere("resources.id", resource_id);
        })
        .save(
          {
            name: name,
            url: encodeURIComponent(url),
          },
          { patch: true }
        );

      return { status: 200, message: "Resource Updated Successful" };
    } catch (e) {
      console.log(e);
      return { status: 400, message: "Unknow Error Updating Resources" };
    }
  },
};
