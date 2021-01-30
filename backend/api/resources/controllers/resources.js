"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const { createTags, createResources } = strapi.config.functions["common"];

module.exports = {
  async autocomplete(ctx) {
    let { slug } = ctx.params;

    slug = slug = slugify(slug, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    let raw = await strapi
      .query("resources")
      .model.query((q) => {
        q.where("resources.slug", "LIKE", `${slug}%`);
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

    const { pageSize = 20, page = 1 } = ctx.query;

    let raw = await strapi
      .query("resources")
      .model.query((q) => {
        q.where("resources.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.resources })
    );

    return result;
  },
  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { resources: input_resources } = ctx.request.body;

    try {
      await createResources(input_resources, authorId);

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
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
        return { status: 304 }; // inuse
      }

      await strapi
        .query("resources")
        .model.query((q) => {
          q.where("resources.author", authorId);
          q.andWhere("resources.id", resource_id);
        })
        .destroy();

      return { status: 200 };
    } catch (e) {
      console.log(e);
      return { status: 400 };
    }
  },
  async update(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id: resource_id } = ctx.params;
    let { url } = ctx.request.body;

    try {
      await strapi
        .query("resources")
        .model.query((q) => {
          q.where("resources.author", authorId);
          q.andWhere("resources.id", resource_id);
        })
        .save(
          {
            url: encodeURIComponent(url),
          },
          { patch: true }
        );

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
};
