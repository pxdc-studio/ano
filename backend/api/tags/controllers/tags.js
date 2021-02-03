"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");

const slugify = require("slugify");

module.exports = {
  async autocomplete(ctx) {
    let { name } = ctx.params;
    let raw = await strapi
      .query("tags")
      .model.query((q) => {
        q.where("tags.name", "LIKE", `${name}%`);
        q.orderBy("created_at", "desc");
      })
      .fetchAll();

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.tags })
    );

    return result;
  },
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { pageSize = 20, page = 0 } = ctx.query;

    let raw = await strapi
      .query("tags")
      .model.query((q) => {
        q.where("tags.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
        limit: pageSize,
        offset: page * pageSize,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.tags })
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
    const { name } = ctx.request.body;

    try {
      const slug = slugify(name, {
        replacement: "-",
        lower: true,
        strict: true,
      });

      const exist = await strapi.query("tags").findOne({
        slug: slug,
      });

      if (exist) {
        return {
          status: 304,
          message: "Tag with the same name is already exist",
        };
      }

      let result = await strapi.query("tags").create({
        slug: slug,
        name: name,
        author: authorId,
      });

      return { status: 200, data: result, message: "Tag created successfull" };
    } catch (e) {
      return { status: 400, message: "Unknowned Error when create Tag" };
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
        return {
          status: 304,
          message: "Tag is already in use by Annoucements",
        }; // inuse
      }

      await strapi
        .query("tags")
        .model.query((q) => {
          q.where("tags.author", authorId);
          q.andWhere("tags.id", tag_id);
        })
        .destroy();

      return { status: 200, message: "Tag Deleted Successfull" };
    } catch (e) {
      return { status: 400, message: "Unknown Error" };
    }
  },
  async update(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id: tag_id } = ctx.params;
    let { name } = ctx.request.body;

    try {
      const slug = slugify(name, {
        replacement: "-",
        lower: true,
        strict: true,
      });

      const exist = await strapi.query("tags").findOne({
        author: authorId,
        id: tag_id,
      });

      if (!exist) {
        return { status: 403, message: "Tag does not belong to You" };
      }

      await strapi.query("tags").update(
        {
          id: tag_id,
        },
        {
          name: name,
          slug: slug,
        }
      );

      return { status: 200, message: "Tag Update Completed" };
    } catch (e) {
      return { status: 400, message: "Unknow Error Update Tag" };
    }
  },
};
