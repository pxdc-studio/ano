"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const {
  create,
  update,
} = require("../../announcements/controllers/announcements");
const { createTags, createResources } = strapi.config.functions["common"];

const slugify = require("slugify");

module.exports = {
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { pageSize = 20, page = 1 } = ctx.query;

    let raw = await strapi
      .query("tags")
      .model.query((q) => {
        q.where("tags.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.tags })
    );

    return result;
  },
  async create(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { tags: input_tags } = ctx.request.body;

    try {
      await createTags(input_tags, authorId);

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
  async delete(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id: tag_id } = ctx.params;

    try {
      const isInUse = await strapi.query("announcements").findOne({
        tags: tag_id,
      });

      if (isInUse) {
        return { status: 304 }; // inuse
      }

      await strapi
        .query("tags")
        .model.query((q) => {
          q.where("tags.author", authorId);
          q.andWhere("tags.id", tag_id);
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

    const { id: tag_id } = ctx.params;
    let { slug } = ctx.request.body;

    try {
      slug = slugify(slug, {
        replacement: "-",
        lower: true,
        strict: true,
      });

      await strapi
        .query("tags")
        .model.query((q) => {
          q.where("tags.author", authorId);
          q.andWhere("tags.id", tag_id);
        })
        .save(
          {
            slug,
          },
          { patch: true }
        );

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
};
