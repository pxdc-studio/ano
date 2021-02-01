"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const { createTags, createResources, createSynonyms } = strapi.config.functions[
  "common"
];

const slugify = require("slugify");

module.exports = {
  async autocomplete(ctx) {
    let { slug } = ctx.params;

    slug = slug = slugify(slug, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    let raw = await strapi
      .query("synonyms")
      .model.query((q) => {
        q.where("synonyms.slug", "LIKE", `${slug}%`);
        q.orderBy("created_at", "desc");
      })
      .fetchAll();

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.synonyms })
    );
    return result;
  },
  async find(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { pageSize = 20, page = 1 } = ctx.query;

    let raw = await strapi
      .query("synonyms")
      .model.query((q) => {
        q.where("synonyms.author", authorId);
        q.orderBy("created_at", "desc");
      })
      .fetchPage({
        pageSize,
        page,
        limit: pageSize,
        offset: page * pageSize,
      });

    const result = raw.map((item) =>
      sanitizeEntity(item, { model: strapi.models.synonyms })
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
    let { tags: input_tags, slug } = ctx.request.body;

    let [_tags] = await Promise.all([createTags(input_tags, authorId)]);

    try {
      await strapi.query("synonyms").create(
        {
          author: authorId,
          slug: slugify(slug, {
            replacement: "-",
            lower: true,
            strict: true,
          }),
          tags: _tags,
        },
        { patch: true }
      );

      return { status: 200 };
    } catch (e) {
      console.log(e);
      return { status: 400 };
    }
  },
  async delete(ctx) {
    const user = ctx.state.user;
    const authorId = user ? user.id : -1; // none reachable user id

    const { id } = ctx.params;

    try {
      const isInUse = await strapi.query("announcements").findOne({
        synonyms: id,
      });

      if (isInUse) {
        return { status: 304 }; // inuse
      }

      await strapi
        .query("synonyms")
        .model.query((q) => {
          q.where("synonyms.author", authorId);
          q.andWhere("synonyms.id", id);
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

    const { id } = ctx.params;
    let { tags: input_tags, slug } = ctx.request.body;

    let isOwner = await strapi.query("synonyms").findOne({
      author: authorId,
      id: id,
    });

    if (!isOwner) {
      return { status: 400 };
    }

    let [_tags] = await Promise.all([createTags(input_tags, authorId)]);

    try {
      await strapi.query("synonyms").update(
        { id: id },
        {
          slug: slugify(slug, {
            replacement: "-",
            lower: true,
            strict: true,
          }),
          tags: _tags,
        },
        { patch: true }
      );

      return { status: 200 };
    } catch (e) {
      console.log(e);
      return { status: 400 };
    }
  },
};
