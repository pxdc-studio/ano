"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const { createTags, createResources, createSynonyms } = strapi.config.functions[
  "common"
];

module.exports = {
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

    const { synonyms: input_synonyms } = ctx.request.body; // [{ slug: "some-slug", tags: ["tag", "tag"] }]

    try {
      let data = await createSynonyms(input_synonyms, authorId);

      return { status: 200, data: data };
    } catch (e) {
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
    let { tags, slug } = ctx.request.body;

    try {
      await strapi
        .query("synonyms")
        .model.query((q) => {
          q.where("synonyms.author", authorId);
          q.andWhere("synonyms.id", id);
        })
        .save(
          {
            slug: slugify(slug, {
              replacement: "-",
              lower: true,
              strict: true,
            }),
            tags: tags.map((tag) =>
              slugify(tag, { replacement: "-", lower: true, strict: true })
            ),
          },
          { patch: true }
        );

      return { status: 200 };
    } catch (e) {
      return { status: 400 };
    }
  },
};
